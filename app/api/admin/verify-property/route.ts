import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const body = await request.json();
    const { property_id, status, notes = 'Verified by VASATI Admin', actor_id = 'usr_adm_1' } = body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json({ success: false, message: 'Invalid status' }, { status: 400 });
    }

    db.prepare(`UPDATE properties SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(status, property_id);

    db.prepare(`
      INSERT INTO audit_logs (id, entity_type, entity_id, action, actor_id, actor_role, details)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      `log_${Date.now()}`,
      'Property',
      property_id,
      `PROPERTY_${status.toUpperCase()}`,
      actor_id,
      'admin',
      `Property status set to ${status}. Notes: ${notes}`
    );

    return NextResponse.json({ success: true, property_id, status });
  } catch (error: any) {
    console.error('Verify Property error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

