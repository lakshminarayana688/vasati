import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    let sql = `
      SELECT c.*, p.name as property_name, u.name as user_name
      FROM complaints c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN properties p ON c.property_id = p.id
      WHERE 1=1
    `;
    const params: string[] = [];

    if (userId) {
      sql += ` AND c.user_id = ?`;
      params.push(userId);
    }

    sql += ` ORDER BY c.created_at DESC`;
    const complaints = db.prepare(sql).all(...params);

    return NextResponse.json({ success: true, complaints });
  } catch (error: any) {
    console.error('Complaints GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const body = await request.json();

    const {
      user_id = 'usr_cust_1',
      property_id,
      booking_id,
      user_role = 'customer',
      category = 'Maintenance',
      subject,
      description,
      priority = 'Medium',
    } = body;

    const id = `cmp_${Date.now()}`;
    const code = `CMP-VAS-${Math.floor(100 + Math.random() * 900)}`;

    db.prepare(`
      INSERT INTO complaints (
        id, complaint_code, user_id, property_id, booking_id,
        user_role, category, subject, description, priority, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'OPEN')
    `).run(id, code, user_id, property_id, booking_id, user_role, category, subject, description, priority);

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (id, entity_type, entity_id, action, actor_id, actor_role, details)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(`log_${Date.now()}`, 'Complaint', id, 'COMPLAINT_RAISED', user_id, user_role, `Complaint ${code} raised: ${subject}`);

    return NextResponse.json({ success: true, complaintCode: code, id });
  } catch (error: any) {
    console.error('Complaint POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const db = getDb();
    const body = await request.json();
    const { id, status, resolution_notes, actor_id = 'usr_adm_1' } = body;

    db.prepare(`
      UPDATE complaints
      SET status = ?, resolution_notes = ?
      WHERE id = ?
    `).run(status, resolution_notes, id);

    db.prepare(`
      INSERT INTO audit_logs (id, entity_type, entity_id, action, actor_id, actor_role, details)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(`log_${Date.now()}`, 'Complaint', id, `COMPLAINT_${status}`, actor_id, 'admin', `Complaint status updated to ${status}`);

    return NextResponse.json({ success: true, id, status });
  } catch (error: any) {
    console.error('Complaint PUT error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

