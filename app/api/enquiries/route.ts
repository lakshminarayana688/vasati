import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const searchParams = request.nextUrl.searchParams;
    const propertyId = searchParams.get('propertyId');
    const userId = searchParams.get('userId');

    let sql = `
      SELECT e.*,
        p.name as property_name,
        c.name as customer_name,
        o.name as owner_name
      FROM enquiries e
      JOIN properties p ON e.property_id = p.id
      JOIN users c ON e.customer_id = c.id
      JOIN users o ON e.owner_id = o.id
      WHERE 1=1
    `;
    const params: string[] = [];

    if (propertyId) {
      sql += ` AND e.property_id = ?`;
      params.push(propertyId);
    }
    if (userId) {
      sql += ` AND (e.customer_id = ? OR e.owner_id = ?)`;
      params.push(userId, userId);
    }

    sql += ` ORDER BY e.created_at DESC`;
    const enquiries = db.prepare(sql).all(...params) as any[];

    // Fetch messages for each enquiry
    const getMessages = db.prepare(`
      SELECT m.*, u.name as sender_name, u.avatar_url as sender_avatar
      FROM conversations m
      JOIN users u ON m.sender_id = u.id
      WHERE m.enquiry_id = ?
      ORDER BY m.created_at ASC
    `);

    const result = enquiries.map(e => ({
      ...e,
      messages: getMessages.all(e.id),
    }));

    return NextResponse.json({ success: true, enquiries: result });
  } catch (error: any) {
    console.error('Enquiries GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const body = await request.json();

    const {
      enquiry_id,
      property_id,
      sender_id = 'usr_cust_1',
      receiver_id = 'usr_own_1',
      message,
      move_in_target_date,
      room_type_interest,
    } = body;

    let targetEnquiryId = enquiry_id;

    // Create enquiry if not exists
    if (!targetEnquiryId) {
      targetEnquiryId = `enq_${Date.now()}`;
      const code = `ENQ-VAS-${Math.floor(1000 + Math.random() * 9000)}`;

      db.prepare(`
        INSERT INTO enquiries (
          id, enquiry_code, property_id, customer_id, owner_id,
          initial_message, move_in_target_date, room_type_interest, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open')
      `).run(
        targetEnquiryId,
        code,
        property_id,
        sender_id,
        receiver_id,
        message,
        move_in_target_date || '',
        room_type_interest || 'Single Room'
      );
    }

    // Insert conversation message
    const msgId = `msg_${Date.now()}`;
    db.prepare(`
      INSERT INTO conversations (id, enquiry_id, property_id, sender_id, receiver_id, message, is_masked)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `).run(msgId, targetEnquiryId, property_id, sender_id, receiver_id, message);

    return NextResponse.json({
      success: true,
      enquiryId: targetEnquiryId,
      messageId: msgId,
    });
  } catch (error: any) {
    console.error('Enquiry message POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

