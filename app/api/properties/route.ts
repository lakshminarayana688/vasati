import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const searchParams = request.nextUrl.searchParams;

    const city = searchParams.get('city') || '';
    const locality = searchParams.get('locality') || '';
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const gender = searchParams.get('gender') || '';
    const pgType = searchParams.get('pgType') || '';
    const food = searchParams.get('food') || '';
    const minRent = parseInt(searchParams.get('minRent') || '0', 10);
    const maxRent = parseInt(searchParams.get('maxRent') || '100000', 10);
    const amenities = searchParams.get('amenities')?.split(',').filter(Boolean) || [];

    let sql = `
      SELECT p.*,
        GROUP_CONCAT(DISTINCT a.key) as amenity_keys,
        GROUP_CONCAT(DISTINCT a.name) as amenity_names,
        (SELECT image_url FROM property_images pi WHERE pi.property_id = p.id ORDER BY pi.is_cover DESC, pi.display_order ASC LIMIT 1) as cover_image
      FROM properties p
      LEFT JOIN property_amenities pa ON p.id = pa.property_id
      LEFT JOIN amenities a ON pa.amenity_id = a.id
      WHERE p.status = 'approved'
    `;
    const params: (string | number)[] = [];

    if (city && city !== 'All') {
      sql += ` AND LOWER(p.city) LIKE LOWER(?)`;
      params.push(`%${city}%`);
    }

    if (locality) {
      sql += ` AND LOWER(p.locality) LIKE LOWER(?)`;
      params.push(`%${locality}%`);
    }

    if (query) {
      sql += ` AND (LOWER(p.name) LIKE LOWER(?) OR LOWER(p.locality) LIKE LOWER(?) OR LOWER(p.address_line) LIKE LOWER(?))`;
      params.push(`%${query}%`, `%${query}%`, `%${query}%`);
    }

    if (category && category !== 'All' && category !== 'All PGs') {
      const catLower = category.toLowerCase().trim();
      if (catLower === 'boys' || catLower === 'boys pg') {
        sql += ` AND p.category = 'Boys PG'`;
      } else if (catLower === 'girls' || catLower === 'girls pg') {
        sql += ` AND p.category = 'Girls PG'`;
      } else if (catLower === 'co-living' || catLower === 'coliving') {
        sql += ` AND p.category = 'Co-living'`;
      } else {
        sql += ` AND p.category = ?`;
        params.push(category);
      }
    } else if (gender && gender !== 'Any') {
      if (gender === 'Boys') {
        sql += ` AND (p.category = 'Boys PG' OR p.category = 'Co-living')`;
      } else if (gender === 'Girls') {
        sql += ` AND (p.category = 'Girls PG' OR p.category = 'Co-living')`;
      }
    }

    if (food && food !== 'Any') {
      if (food === 'Veg') {
        sql += ` AND (p.food_type = 'Veg' OR p.food_type = 'Both')`;
      } else if (food === 'Non-Veg') {
        sql += ` AND (p.food_type = 'Non-Veg' OR p.food_type = 'Both')`;
      }
    }

    if (minRent > 0) {
      sql += ` AND p.monthly_rent_from >= ?`;
      params.push(minRent);
    }

    if (maxRent < 100000) {
      sql += ` AND p.monthly_rent_from <= ?`;
      params.push(maxRent);
    }

    sql += ` GROUP BY p.id ORDER BY p.is_featured DESC, p.rating DESC, p.created_at DESC`;

    const rawRows = db.prepare(sql).all(...params) as any[];

    // Filter by amenities if requested
    let results = rawRows.map(row => {
      const keys = (row.amenity_keys || '').split(',').filter(Boolean);
      const names = (row.amenity_names || '').split(',').filter(Boolean);
      return {
        ...row,
        amenities: keys,
        amenityNames: names,
      };
    });

    if (amenities.length > 0) {
      results = results.filter(p =>
        amenities.every((amKey: string) => p.amenities.includes(amKey))
      );
    }

    // Attach rooms info
    const getRooms = db.prepare(`SELECT * FROM rooms WHERE property_id = ?`);
    results = results.map(p => ({
      ...p,
      rooms: getRooms.all(p.id),
    }));

    return NextResponse.json({
      success: true,
      total: results.length,
      properties: results,
    });
  } catch (error: any) {
    console.error('Properties API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const body = await request.json();

    const {
      owner_id = 'usr_own_1',
      name,
      tagline,
      description,
      category = 'Co-living',
      property_type = 'PG',
      address_line,
      locality,
      city = 'Bengaluru',
      state = 'Karnataka',
      pincode = '560001',
      latitude = 12.9716,
      longitude = 77.5946,
      monthly_rent_from,
      security_deposit,
      food_type = 'Both',
      house_rules,
      amenities = [],
      images = [],
      rooms = [],
    } = body;

    const id = `prop_${Date.now()}`;
    const approxLoc = `Near ${locality}, ${city} (~450m radius)`;

    const insertProp = db.prepare(`
      INSERT INTO properties (
        id, owner_id, name, tagline, description, category, property_type,
        address_line, locality, city, state, pincode, latitude, longitude,
        approximate_location, monthly_rent_from, security_deposit, food_type,
        house_rules, status, rating, review_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', 4.8, 1)
    `);

    insertProp.run(
      id, owner_id, name, tagline, description, category, property_type,
      address_line, locality, city, state, pincode, latitude, longitude,
      approxLoc, monthly_rent_from || 7000, security_deposit || 7000, food_type,
      house_rules || 'Standard PG house rules'
    );

    // Insert images
    const insertImg = db.prepare(`
      INSERT INTO property_images (id, property_id, image_url, caption, display_order, is_cover)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    images.forEach((url: string, idx: number) => {
      insertImg.run(`${id}_img_${idx}`, id, url, `${name} Photo`, idx, idx === 0 ? 1 : 0);
    });

    // Insert rooms
    const insertRoom = db.prepare(`
      INSERT INTO rooms (id, property_id, room_type, monthly_rent, security_deposit, total_beds, available_beds, description, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    rooms.forEach((r: any, idx: number) => {
      insertRoom.run(
        `${id}_rm_${idx}`, id, r.room_type, r.monthly_rent, r.security_deposit || r.monthly_rent,
        r.total_beds || 10, r.available_beds || 5, r.description || '', r.image_url || images[0] || ''
      );
    });

    // Insert amenities
    const insertAmenity = db.prepare(`
      INSERT OR IGNORE INTO property_amenities (id, property_id, amenity_id)
      VALUES (?, ?, (SELECT id FROM amenities WHERE key = ? LIMIT 1))
    `);
    amenities.forEach((key: string) => {
      insertAmenity.run(`${id}_${key}`, id, key);
    });

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (id, entity_type, entity_id, action, actor_id, actor_role, details)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(`log_${Date.now()}`, 'Property', id, 'PROPERTY_CREATED', owner_id, 'owner', `Owner added new property ${name}`);

    return NextResponse.json({ success: true, id, message: 'Property added successfully' });
  } catch (error: any) {
    console.error('Add Property error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

