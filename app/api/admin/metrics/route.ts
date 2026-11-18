import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();

    const totalCustomers = (db.prepare(`SELECT COUNT(*) as c FROM users WHERE role = 'customer'`).get() as any).c;
    const totalOwners = (db.prepare(`SELECT COUNT(*) as c FROM users WHERE role = 'owner'`).get() as any).c;
    const totalProperties = (db.prepare(`SELECT COUNT(*) as c FROM properties`).get() as any).c;
    const pendingProperties = (db.prepare(`SELECT COUNT(*) as c FROM properties WHERE status = 'pending'`).get() as any).c;
    const verifiedProperties = (db.prepare(`SELECT COUNT(*) as c FROM properties WHERE status = 'approved'`).get() as any).c;

    const roomStats = db.prepare(`SELECT SUM(total_beds) as total_beds, SUM(available_beds) as available_beds FROM rooms`).get() as any;
    const totalBeds = roomStats?.total_beds || 0;
    const availableBeds = roomStats?.available_beds || 0;

    const totalBookings = (db.prepare(`SELECT COUNT(*) as c FROM bookings`).get() as any).c;
    const cancelledBookings = (db.prepare(`SELECT COUNT(*) as c FROM bookings WHERE status = 'Cancelled'`).get() as any).c;

    const commissionStats = db.prepare(`
      SELECT
        SUM(CASE WHEN status != 'CANCELLED' THEN commission_amount ELSE 0 END) as total_commission,
        SUM(CASE WHEN status = 'PENDING' THEN commission_amount ELSE 0 END) as pending_commission
      FROM commissions
    `).get() as any;

    const totalCommissionRevenue = commissionStats?.total_commission || 0;
    const pendingOwnerCommissions = commissionStats?.pending_commission || 0;

    const totalPayments = (db.prepare(`SELECT COUNT(*) as c FROM booking_payments WHERE status = 'SUCCESS'`).get() as any).c;
    const totalPaymentVolume = (db.prepare(`SELECT SUM(amount) as s FROM booking_payments WHERE status = 'SUCCESS'`).get() as any).s || 0;

    const complaintsOpen = (db.prepare(`SELECT COUNT(*) as c FROM complaints WHERE status = 'OPEN'`).get() as any).c;
    const complaintsTotal = (db.prepare(`SELECT COUNT(*) as c FROM complaints`).get() as any).c;

    // Recent properties
    const recentProperties = db.prepare(`
      SELECT p.*, u.name as owner_name, u.email as owner_email
      FROM properties p
      JOIN users u ON p.owner_id = u.id
      ORDER BY p.created_at DESC
      LIMIT 10
    `).all();

    // Recent bookings
    const recentBookings = db.prepare(`
      SELECT b.*, p.name as property_name, u.name as customer_name, o.name as owner_name
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN users u ON b.customer_id = u.id
      JOIN users o ON b.owner_id = o.id
      ORDER BY b.created_at DESC
      LIMIT 10
    `).all();

    // Recent audit logs
    const recentAuditLogs = db.prepare(`
      SELECT * FROM audit_logs
      ORDER BY timestamp DESC
      LIMIT 20
    `).all();

    // All complaints
    const complaints = db.prepare(`
      SELECT c.*, u.name as user_name, u.email as user_email, p.name as property_name
      FROM complaints c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN properties p ON c.property_id = p.id
      ORDER BY c.created_at DESC
    `).all();

    return NextResponse.json({
      success: true,
      kpis: {
        totalCustomers,
        totalOwners,
        totalProperties,
        pendingProperties,
        verifiedProperties,
        totalBeds,
        availableBeds,
        totalBookings,
        cancelledBookings,
        totalCommissionRevenue,
        pendingOwnerCommissions,
        totalPayments,
        totalPaymentVolume,
        complaintsOpen,
        complaintsTotal,
      },
      recentProperties,
      recentBookings,
      recentAuditLogs,
      complaints,
    });
  } catch (error: any) {
    console.error('Admin metrics error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

