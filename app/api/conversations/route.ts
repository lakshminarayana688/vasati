import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const searchParams = request.nextUrl.searchParams;
    const propertyId = searchParams.get('propertyId');
    const customerId = searchParams.get('customerId') || searchParams.get('userId') || 'usr_cust_1';

    if (!propertyId) {
      return NextResponse.json({ success: false, error: 'Property ID is required' }, { status: 400 });
    }

    // Fetch property and owner info
    const property = db.prepare(`
      SELECT p.id, p.name, p.owner_id, u.name as owner_name, u.avatar_url as owner_avatar
      FROM properties p
      JOIN users u ON p.owner_id = u.id
      WHERE p.id = ?
    `).get(propertyId) as any;

    if (!property) {
      return NextResponse.json({ success: false, error: 'Property not found' }, { status: 404 });
    }

    // Fetch conversation messages
    const messages = db.prepare(`
      SELECT 
        c.id,
        c.enquiry_id,
        c.property_id,
        c.sender_id,
        c.receiver_id,
        c.message,
        c.is_masked,
        c.created_at,
        u.name as sender_name,
        u.avatar_url as sender_avatar,
        u.role as sender_role
      FROM conversations c
      JOIN users u ON c.sender_id = u.id
      WHERE c.property_id = ?
        AND ((c.sender_id = ? AND c.receiver_id = ?) OR (c.sender_id = ? AND c.receiver_id = ?))
      ORDER BY c.created_at ASC
    `).all(propertyId, customerId, property.owner_id, property.owner_id, customerId) as any[];

    return NextResponse.json({
      success: true,
      property: {
        id: property.id,
        name: property.name,
        owner_id: property.owner_id,
        owner_name: property.owner_name,
      },
      messages: messages.map(m => ({
        id: m.id,
        sender_id: m.sender_id,
        sender_name: m.sender_name,
        sender_role: m.sender_role,
        receiver_id: m.receiver_id,
        message: m.message,
        created_at: m.created_at,
        status: 'sent',
      })),
    });
  } catch (error: any) {
    console.error('Conversations GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const body = await request.json();
    const {
      property_id,
      sender_id = 'usr_cust_1',
      receiver_id,
      message,
    } = body;

    if (!property_id || !message || !message.trim()) {
      return NextResponse.json(
        { success: false, error: 'property_id and a non-empty message are required' },
        { status: 400 }
      );
    }

    // Resolve owner_id if receiver_id is missing
    let actualReceiverId = receiver_id;
    if (!actualReceiverId) {
      const prop = db.prepare('SELECT owner_id FROM properties WHERE id = ?').get(property_id) as any;
      actualReceiverId = prop?.owner_id || 'usr_own_1';
    }

    // Ensure enquiry exists
    let enquiry = db.prepare(`
      SELECT id FROM enquiries
      WHERE property_id = ? AND customer_id = ?
      LIMIT 1
    `).get(property_id, sender_id) as any;

    let enquiryId = enquiry?.id;
    if (!enquiryId) {
      enquiryId = `enq_${Date.now()}`;
      const code = `ENQ-VAS-${Math.floor(1000 + Math.random() * 9000)}`;
      db.prepare(`
        INSERT INTO enquiries (
          id, enquiry_code, property_id, customer_id, owner_id,
          initial_message, status
        ) VALUES (?, ?, ?, ?, ?, ?, 'open')
      `).run(enquiryId, code, property_id, sender_id, actualReceiverId, message.trim());
    }

    const msgId = `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    db.prepare(`
      INSERT INTO conversations (id, enquiry_id, property_id, sender_id, receiver_id, message, is_masked, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 1, ?)
    `).run(msgId, enquiryId, property_id, sender_id, actualReceiverId, message.trim(), now);

    // Get sender info
    const sender = db.prepare('SELECT name, role FROM users WHERE id = ?').get(sender_id) as any;

    // Check if an automated host response should be scheduled if this is customer sending to host
    let autoReply: any = null;
    if (sender?.role === 'customer') {
      const count = db.prepare(`
        SELECT COUNT(*) as count FROM conversations
        WHERE property_id = ? AND sender_id = ?
      `).get(property_id, actualReceiverId) as any;

      if (count.count === 0 || Math.random() > 0.5) {
        // Create realistic host reply
        const hostReplies = [
          "Hello! Thanks for reaching out. Yes, the room is available for immediate occupancy. When would you like to visit?",
          "Hi! We provide 3 meals daily, high-speed Wi-Fi, and 24x7 power backup. You are welcome to schedule a visit anytime!",
          "Hello! Yes, parking space is available and the security deposit is 100% refundable as per VASATI policy.",
        ];
        const hostMsgText = hostReplies[Math.floor(Math.random() * hostReplies.length)];
        const hostMsgId = `msg_reply_${Date.now()}`;
        const hostNow = new Date(Date.now() + 1000).toISOString().replace('T', ' ').substring(0, 19);

        db.prepare(`
          INSERT INTO conversations (id, enquiry_id, property_id, sender_id, receiver_id, message, is_masked, created_at)
          VALUES (?, ?, ?, ?, ?, ?, 1, ?)
        `).run(hostMsgId, enquiryId, property_id, actualReceiverId, sender_id, hostMsgText, hostNow);

        const hostUser = db.prepare('SELECT name FROM users WHERE id = ?').get(actualReceiverId) as any;
        autoReply = {
          id: hostMsgId,
          sender_id: actualReceiverId,
          sender_name: hostUser?.name || 'Host',
          sender_role: 'owner',
          receiver_id: sender_id,
          message: hostMsgText,
          created_at: hostNow,
          status: 'sent',
        };
      }
    }

    return NextResponse.json({
      success: true,
      message: {
        id: msgId,
        sender_id,
        sender_name: sender?.name || 'Customer',
        sender_role: sender?.role || 'customer',
        receiver_id: actualReceiverId,
        message: message.trim(),
        created_at: now,
        status: 'sent',
      },
      autoReply,
    });
  } catch (error: any) {
    console.error('Conversation message POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
