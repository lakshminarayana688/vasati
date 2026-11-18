import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get('role');

    let sql = `
      SELECT u.*,
        cp.college_or_company,
        cp.emergency_contact,
        op.business_name,
        op.kyc_status,
        op.commission_agreement_accepted,
        op.commission_rate
      FROM users u
      LEFT JOIN customer_profiles cp ON u.id = cp.user_id
      LEFT JOIN owner_profiles op ON u.id = op.user_id
      WHERE 1=1
    `;
    const params: string[] = [];

    if (role) {
      sql += ` AND u.role = ?`;
      params.push(role);
    }

    sql += ` ORDER BY u.created_at DESC`;
    const users = db.prepare(sql).all(...params);

    return NextResponse.json({ success: true, total: users.length, users });
  } catch (error: any) {
    console.error('Admin Users error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const db = getDb();
    const body = await request.json();
    const { user_id, kyc_status, role } = body;

    if (kyc_status) {
      db.prepare(`UPDATE owner_profiles SET kyc_status = ? WHERE user_id = ?`).run(kyc_status, user_id);
    }

    if (role) {
      db.prepare(`UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(role, user_id);
    }

    return NextResponse.json({ success: true, message: 'User updated successfully' });
  } catch (error: any) {
    console.error('Admin User update error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

