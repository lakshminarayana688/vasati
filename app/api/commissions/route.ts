import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const searchParams = request.nextUrl.searchParams;
    const ownerId = searchParams.get('ownerId');

    let sql = `
      SELECT c.*,
        b.booking_code,
        b.duration_months,
        b.move_in_date,
        b.total_amount as gross_booking_amount,
        b.security_deposit,
        b.status as booking_status,
        p.name as property_name,
        p.locality as property_locality,
        cust.name as customer_name,
        o.name as owner_name,
        s.settlement_status,
        s.payout_amount,
        s.payout_method,
        s.payout_reference,
        s.settled_at
      FROM commissions c
      JOIN bookings b ON c.booking_id = b.id
      JOIN properties p ON b.property_id = p.id
      JOIN users cust ON b.customer_id = cust.id
      JOIN users o ON c.owner_id = o.id
      LEFT JOIN owner_settlements s ON c.id = s.commission_id
      WHERE 1=1
    `;
    const params: string[] = [];

    if (ownerId) {
      sql += ` AND c.owner_id = ?`;
      params.push(ownerId);
    }

    sql += ` ORDER BY c.created_at DESC`;
    const rows = db.prepare(sql).all(...params);

    // Summary calculation
    const totalCommissions = rows.reduce((acc: number, r: any) => acc + (r.commission_amount || 0), 0);
    const totalGross = rows.reduce((acc: number, r: any) => acc + (r.gross_booking_amount || 0), 0);
    const totalOwnerPayout = rows.reduce((acc: number, r: any) => acc + (r.owner_net_amount || 0), 0);

    return NextResponse.json({
      success: true,
      summary: {
        totalRecords: rows.length,
        totalCommissions,
        totalGross,
        totalOwnerPayout,
        standardRate: '8% of first month rent',
      },
      statements: rows,
    });
  } catch (error: any) {
    console.error('Commissions GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

