import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const searchParams = request.nextUrl.searchParams;
    const customerId = searchParams.get('customerId');
    const ownerId = searchParams.get('ownerId');
    const status = searchParams.get('status');

    let sql = `
      SELECT b.*,
        p.name as property_name,
        p.locality as property_locality,
        p.city as property_city,
        p.address_line as property_address,
        (SELECT image_url FROM property_images pi WHERE pi.property_id = p.id ORDER BY pi.is_cover DESC, pi.display_order ASC LIMIT 1) as property_cover,
        c.name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        o.name as owner_name,
        comm.commission_amount,
        comm.owner_net_amount,
        comm.status as commission_status,
        comm.invoice_number,
        pay.payment_method,
        pay.transaction_reference
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN users c ON b.customer_id = c.id
      JOIN users o ON b.owner_id = o.id
      LEFT JOIN commissions comm ON b.id = comm.booking_id
      LEFT JOIN booking_payments pay ON b.id = pay.booking_id
      WHERE 1=1
    `;
    const params: string[] = [];

    if (customerId) {
      sql += ` AND b.customer_id = ?`;
      params.push(customerId);
    }

    if (ownerId) {
      sql += ` AND b.owner_id = ?`;
      params.push(ownerId);
    }

    if (status && status !== 'All') {
      sql += ` AND b.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY b.created_at DESC`;

    const bookings = db.prepare(sql).all(...params);
    return NextResponse.json({ success: true, total: bookings.length, bookings });
  } catch (error: any) {
    console.error('Bookings GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const body = await request.json();

    const {
      property_id,
      room_id,
      customer_id = 'usr_cust_1',
      room_type,
      duration_months = 1,
      move_in_date,
      payment_method = 'UPI',
    } = body;

    // Fetch property and room
    const property = db.prepare(`SELECT * FROM properties WHERE id = ?`).get(property_id) as any;
    if (!property) {
      return NextResponse.json({ success: false, message: 'Property not found' }, { status: 404 });
    }

    const room = db.prepare(`SELECT * FROM rooms WHERE id = ?`).get(room_id) as any;
    const monthlyRent = room ? room.monthly_rent : property.monthly_rent_from;
    const securityDeposit = room ? room.security_deposit : property.security_deposit;

    const durationRentTotal = monthlyRent * Number(duration_months);
    const totalAmount = durationRentTotal; // Total rental stay amount

    const bookingId = `bk_${Date.now()}`;
    const bookingCode = `BK-VAS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create booking in 'Confirmed' state upon instant payment flow
    const insertBooking = db.prepare(`
      INSERT INTO bookings (
        id, booking_code, property_id, room_id, customer_id, owner_id,
        room_type, duration_months, move_in_date, monthly_rent,
        duration_rent_total, security_deposit, maintenance_charge,
        discount_amount, total_amount, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertBooking.run(
      bookingId,
      bookingCode,
      property_id,
      room ? room.id : 'rm_default',
      customer_id,
      property.owner_id,
      room_type || (room ? room.room_type : 'Single Room'),
      duration_months,
      move_in_date || new Date().toISOString().split('T')[0],
      monthlyRent,
      durationRentTotal,
      securityDeposit,
      0, // Maintenance
      0, // Discount
      totalAmount,
      'Confirmed'
    );

    // Create payment record
    const paymentId = `pay_${Date.now()}`;
    const paymentCode = `PAY-VAS-${Math.floor(1000 + Math.random() * 9000)}`;
    const txnRef = `TXN_${payment_method.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}_${Date.now()}`;

    db.prepare(`
      INSERT INTO booking_payments (
        id, booking_id, payment_code, amount, payment_method, payment_provider, transaction_reference, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      paymentId,
      bookingId,
      paymentCode,
      totalAmount,
      payment_method,
      'Razorpay / VASATI Smart Gateway',
      txnRef,
      'SUCCESS'
    );

    // Calculate VASATI Commission:
    // 8% of first month's agreed rent
    // Example: monthly_rent: 8,000 -> commission: 640, owner amount: 7,360 (+ remaining months)
    const firstMonthCommission = Math.round(monthlyRent * 0.08);
    const ownerNetAfterCommission = totalAmount - firstMonthCommission;
    const invoiceNum = `INV-VAS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const commissionId = `com_${Date.now()}`;

    db.prepare(`
      INSERT INTO commissions (
        id, booking_id, owner_id, base_first_month_rent, commission_rate,
        commission_amount, owner_net_amount, status, move_in_condition_met, invoice_number
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      commissionId,
      bookingId,
      property.owner_id,
      monthlyRent,
      0.08,
      firstMonthCommission,
      ownerNetAfterCommission,
      'ACCRUED',
      1,
      invoiceNum
    );

    // Create owner settlement ledger entry
    db.prepare(`
      INSERT INTO owner_settlements (
        id, owner_id, commission_id, gross_booking_amount, commission_deducted,
        payout_amount, settlement_status, payout_method, payout_reference
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `set_${Date.now()}`,
      property.owner_id,
      commissionId,
      totalAmount,
      firstMonthCommission,
      ownerNetAfterCommission,
      'PROCESSED',
      'IMPS Bank Transfer',
      `IMPS_${Date.now()}`
    );

    // Add rent reminder
    db.prepare(`
      INSERT INTO rent_reminders (id, booking_id, user_id, due_date, amount, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      `rem_${Date.now()}`,
      bookingId,
      customer_id,
      move_in_date || new Date().toISOString().split('T')[0],
      monthlyRent,
      'UPCOMING'
    );

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (id, entity_type, entity_id, action, actor_id, actor_role, details)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      `log_${Date.now()}`,
      'Booking',
      bookingId,
      'BOOKING_CREATED_AND_PAID',
      customer_id,
      'customer',
      `Booking ${bookingCode} for ${property.name} completed with payment of ₹${totalAmount.toLocaleString('en-IN')}. Commission ₹${firstMonthCommission} recorded.`
    );

    return NextResponse.json({
      success: true,
      booking: {
        id: bookingId,
        bookingCode,
        totalAmount,
        monthlyRent,
        securityDeposit,
        durationMonths: duration_months,
        commissionAmount: firstMonthCommission,
        ownerNetAmount: ownerNetAfterCommission,
        invoiceNumber: invoiceNum,
        transactionReference: txnRef,
        status: 'Confirmed',
      },
    });
  } catch (error: any) {
    console.error('Booking POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

