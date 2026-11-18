import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const { id } = params;

    const property = db.prepare(`SELECT * FROM properties WHERE id = ?`).get(id) as any;
    if (!property) {
      return NextResponse.json({ success: false, message: 'Property not found' }, { status: 404 });
    }

    // Get images
    const images = db.prepare(`
      SELECT * FROM property_images WHERE property_id = ? ORDER BY is_cover DESC, display_order ASC
    `).all(id);

    // Get rooms
    const rooms = db.prepare(`
      SELECT * FROM rooms WHERE property_id = ?
    `).all(id);

    // Get amenities
    const amenities = db.prepare(`
      SELECT a.* FROM property_amenities pa
      JOIN amenities a ON pa.amenity_id = a.id
      WHERE pa.property_id = ?
    `).all(id);

    // Get reviews
    const reviews = db.prepare(`
      SELECT r.*, u.name as reviewer_name, u.avatar_url as reviewer_avatar
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.property_id = ?
      ORDER BY r.created_at DESC
    `).all(id);

    // Anti-Bypass Protection: Mask owner phone & personal identity
    // Public listings show verified badge & in-app chat only
    const owner = db.prepare(`
      SELECT u.id, u.name, op.business_name, op.kyc_status
      FROM users u
      LEFT JOIN owner_profiles op ON u.id = op.user_id
      WHERE u.id = ?
    `).get(property.owner_id) as any;

    return NextResponse.json({
      success: true,
      property: {
        ...property,
        images,
        rooms,
        amenities,
        reviews,
        owner: {
          id: owner?.id,
          businessName: owner?.business_name || owner?.name || 'Verified VASATI Host',
          isKycVerified: owner?.kyc_status === 'verified',
          // Masked contact - Anti-bypass rule:
          contactMode: 'In-App Secure Messaging & Masked Calling Only',
        },
      },
    });
  } catch (error: any) {
    console.error('Property details error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

