import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

const VALID_STATUSES = [
  'Pending',
  'Owner Accepted',
  'Payment Pending',
  'Confirmed',
  'Move-in Pending',
  'Checked In',
  'Completed',
  'Cancelled',
  'Refund Pending',
  'Refunded',
];

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const { id } = params;
    const body = await request.json();
    const { status, actorId = 'usr_own_1', actorRole = 'owner', notes } = body;

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ success: false, message: 'Invalid booking status' }, { status: 400 });
    }

    const currentBooking = db.prepare(`SELECT * FROM bookings WHERE id = ?`).get(id) as any;
    if (!currentBooking) {
      return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
    }

    db.prepare(`
      UPDATE bookings
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, id);

    // If cancelled, update commission status
    if (status === 'Cancelled' || status === 'Refunded') {
      db.prepare(`
        UPDATE commissions
        SET status = 'CANCELLED'
        WHERE booking_id = ?
      `).run(id);
    }

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (id, entity_type, entity_id, action, actor_id, actor_role, details)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      `log_${Date.now()}`,
      'Booking',
      id,
      `STATUS_CHANGED_TO_${status.toUpperCase().replace(/\s+/g, '_')}`,
      actorId,
      actorRole,
      `Status changed from ${currentBooking.status} to ${status}. Notes: ${notes || 'None'}`
    );

    return NextResponse.json({
      success: true,
      bookingId: id,
      newStatus: status,
      previousStatus: currentBooking.status,
    });
  } catch (error: any) {
    console.error('Booking status update error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

