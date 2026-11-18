import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    db.exec(`
      CREATE TABLE IF NOT EXISTS refunds (
        id TEXT PRIMARY KEY,
        booking_id TEXT NOT NULL,
        amount INTEGER NOT NULL,
        reason TEXT,
        status TEXT CHECK(status IN ('PENDING', 'APPROVED', 'REJECTED', 'PROCESSED')) DEFAULT 'PENDING',
        requested_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        processed_at DATETIME,
        FOREIGN KEY(booking_id) REFERENCES bookings(id)
      );
    `);

    const sql = `
      SELECT r.*,
        b.booking_code,
        b.total_amount,
        b.security_deposit,
        b.status as booking_status,
        p.name as property_name,
        u.name as customer_name,
        u.email as customer_email
      FROM refunds r
      JOIN bookings b ON r.booking_id = b.id
      JOIN properties p ON b.property_id = p.id
      JOIN users u ON b.customer_id = u.id
      ORDER BY r.created_at DESC
    `;
    const refunds = db.prepare(sql).all();
    return NextResponse.json({ success: true, refunds });
  } catch (error: any) {
    console.error('Refunds GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const body = await request.json();
    const { booking_id, reason, requested_by = 'usr_cust_1' } = body;

    const booking = db.prepare(`SELECT * FROM bookings WHERE id = ?`).get(booking_id) as any;
    if (!booking) {
      return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
    }

    const refundId = `ref_${Date.now()}`;
    const refundAmount = booking.total_amount;

    // Check if table exists, create if not
    db.exec(`
      CREATE TABLE IF NOT EXISTS refunds (
        id TEXT PRIMARY KEY,
        booking_id TEXT NOT NULL,
        amount INTEGER NOT NULL,
        reason TEXT,
        status TEXT CHECK(status IN ('PENDING', 'APPROVED', 'REJECTED', 'PROCESSED')) DEFAULT 'PENDING',
        requested_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        processed_at DATETIME,
        FOREIGN KEY(booking_id) REFERENCES bookings(id)
      );
    `);

    db.prepare(`
      INSERT INTO refunds (id, booking_id, amount, reason, status, requested_by)
      VALUES (?, ?, ?, ?, 'PENDING', ?)
    `).run(refundId, booking_id, refundAmount, reason || 'Tenant cancelled stay before check-in', requested_by);

    // Update booking status to 'Refund Pending'
    db.prepare(`UPDATE bookings SET status = 'Refund Pending', updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(booking_id);

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (id, entity_type, entity_id, action, actor_id, actor_role, details)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      `log_${Date.now()}`,
      'Refund',
      refundId,
      'REFUND_REQUESTED',
      requested_by,
      'customer',
      `Refund requested for booking ${booking.booking_code}. Amount: ₹${refundAmount}. Reason: ${reason}`
    );

    return NextResponse.json({ success: true, refundId, status: 'Refund Pending' });
  } catch (error: any) {
    console.error('Refund POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const db = getDb();
    const body = await request.json();
    const { refund_id, status = 'PROCESSED', actor_id = 'usr_adm_1' } = body;

    const refund = db.prepare(`SELECT * FROM refunds WHERE id = ?`).get(refund_id) as any;
    if (!refund) {
      return NextResponse.json({ success: false, message: 'Refund not found' }, { status: 404 });
    }

    db.prepare(`
      UPDATE refunds
      SET status = ?, processed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, refund_id);

    if (status === 'PROCESSED' || status === 'APPROVED') {
      // Set booking status to 'Refunded'
      db.prepare(`UPDATE bookings SET status = 'Refunded', updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(refund.booking_id);
      // Cancel commission
      db.prepare(`UPDATE commissions SET status = 'CANCELLED' WHERE booking_id = ?`).run(refund.booking_id);
    }

    db.prepare(`
      INSERT INTO audit_logs (id, entity_type, entity_id, action, actor_id, actor_role, details)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      `log_${Date.now()}`,
      'Refund',
      refund_id,
      `REFUND_${status}`,
      actor_id,
      'admin',
      `Refund ${refund_id} marked as ${status}`
    );

    return NextResponse.json({ success: true, refund_id, status });
  } catch (error: any) {
    console.error('Refund PUT error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

