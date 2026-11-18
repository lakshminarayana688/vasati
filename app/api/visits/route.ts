import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const searchParams = request.nextUrl.searchParams;
    const customerId = searchParams.get('customerId');
    const ownerId = searchParams.get('ownerId');

    let sql = `
      SELECT v.*,
        p.name as property_name,
        p.locality as property_locality,
        p.city as property_city,
        (SELECT image_url FROM property_images pi WHERE pi.property_id = p.id ORDER BY pi.is_cover DESC, pi.display_order ASC LIMIT 1) as property_cover,
        c.name as customer_name,
        c.phone as customer_phone,
        o.name as owner_name
      FROM visits v
      JOIN properties p ON v.property_id = p.id
      JOIN users c ON v.customer_id = c.id
      JOIN users o ON v.owner_id = o.id
      WHERE 1=1
    `;
    const params: string[] = [];

    if (customerId) {
      sql += ` AND v.customer_id = ?`;
      params.push(customerId);
    }
    if (ownerId) {
      sql += ` AND v.owner_id = ?`;
      params.push(ownerId);
    }

    sql += ` ORDER BY v.created_at DESC`;
    const visits = db.prepare(sql).all(...params);

    return NextResponse.json({ success: true, visits });
  } catch (error: any) {
    console.error('Visits GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const body = await request.json();

    const {
      property_id,
      customer_id = 'usr_cust_1',
      visit_date,
      visit_time,
      notes,
    } = body;

    const property = db.prepare(`SELECT * FROM properties WHERE id = ?`).get(property_id) as any;
    if (!property) {
      return NextResponse.json({ success: false, message: 'Property not found' }, { status: 404 });
    }

    const id = `vst_${Date.now()}`;
    const visitCode = `VST-VAS-${Math.floor(1000 + Math.random() * 9000)}`;

    db.prepare(`
      INSERT INTO visits (
        id, visit_code, property_id, customer_id, owner_id,
        visit_date, visit_time, status, notes,
        approximate_address, unlocked_full_address
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)
    `).run(
      id,
      visitCode,
      property_id,
      customer_id,
      property.owner_id,
      visit_date,
      visit_time,
      notes || '',
      property.approximate_location || `Near ${property.locality}, ${property.city}`,
      `${property.address_line}, ${property.locality}, ${property.city} - ${property.pincode}`
    );

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (id, entity_type, entity_id, action, actor_id, actor_role, details)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      `log_${Date.now()}`,
      'Visit',
      id,
      'VISIT_REQUESTED',
      customer_id,
      'customer',
      `Visit ${visitCode} requested for ${property.name} on ${visit_date} at ${visit_time}`
    );

    return NextResponse.json({
      success: true,
      visit: {
        id,
        visitCode,
        status: 'pending',
        visitDate: visit_date,
        visitTime: visit_time,
      },
    });
  } catch (error: any) {
    console.error('Visit POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const db = getDb();
    const body = await request.json();
    const { id, status, actorId = 'usr_own_1' } = body;

    const visit = db.prepare(`SELECT * FROM visits WHERE id = ?`).get(id) as any;
    if (!visit) {
      return NextResponse.json({ success: false, message: 'Visit not found' }, { status: 404 });
    }

    db.prepare(`UPDATE visits SET status = ? WHERE id = ?`).run(status, id);

    db.prepare(`
      INSERT INTO audit_logs (id, entity_type, entity_id, action, actor_id, actor_role, details)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      `log_${Date.now()}`,
      'Visit',
      id,
      `VISIT_${status.toUpperCase()}`,
      actorId,
      'owner',
      `Visit ${visit.visit_code} marked as ${status}`
    );

    return NextResponse.json({ success: true, id, status });
  } catch (error: any) {
    console.error('Visit PUT error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

