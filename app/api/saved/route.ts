import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || 'usr_cust_1';

    const saved = db.prepare(`
      SELECT p.*,
        (SELECT image_url FROM property_images pi WHERE pi.property_id = p.id ORDER BY pi.is_cover DESC, pi.display_order ASC LIMIT 1) as cover_image
      FROM saved_properties sp
      JOIN properties p ON sp.property_id = p.id
      WHERE sp.user_id = ?
      ORDER BY sp.created_at DESC
    `).all(userId);

    const savedIds = saved.map((s: any) => s.id);

    return NextResponse.json({ success: true, saved, savedIds });
  } catch (error: any) {
    console.error('Saved GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const body = await request.json();
    const { userId = 'usr_cust_1', propertyId } = body;

    const existing = db.prepare(`
      SELECT id FROM saved_properties WHERE user_id = ? AND property_id = ?
    `).get(userId, propertyId);

    if (existing) {
      db.prepare(`
        DELETE FROM saved_properties WHERE user_id = ? AND property_id = ?
      `).run(userId, propertyId);
      return NextResponse.json({ success: true, saved: false });
    } else {
      db.prepare(`
        INSERT INTO saved_properties (id, user_id, property_id)
        VALUES (?, ?, ?)
      `).run(`fav_${Date.now()}`, userId, propertyId);
      return NextResponse.json({ success: true, saved: true });
    }
  } catch (error: any) {
    console.error('Saved POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

