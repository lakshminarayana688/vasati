const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '..', 'vasati.db'));

const newProps = [
  {
    id: 'prop_zolo_cyberstay',
    owner_id: 'usr_own_1',
    name: 'Zolo Cyberstay Luxury PG',
    tagline: 'Premium Co-living in the Heart of Cyber City',
    description: 'Ultra-modern co-living residence in Gachibowli near DLF Cyber City and Mindspace IT Park. Features high-speed fiber internet, housekeeping, chef-curated meals, gym, and 24x7 security.',
    category: 'Co-living',
    property_type: 'Co-living',
    address_line: 'Plot 42, Gachibowli Financial District',
    locality: 'Gachibowli',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500032',
    latitude: 17.4401,
    longitude: 78.3489,
    approximate_location: 'Near DLF Cyber City, Gachibowli (~400m radius)',
    monthly_rent_from: 8500,
    security_deposit: 8500,
    notice_period_days: 30,
    food_type: 'Both',
    meals_included: 1,
    house_rules: 'Visitors permitted in lounge. Quiet hours after 11 PM.',
    status: 'approved',
    is_featured: 1,
    is_premium: 1,
    rating: 4.8,
    review_count: 680,
    images: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80'
    ],
    rooms: [
      { id: 'rm_zc_1', room_type: 'Single Room', monthly_rent: 12000, security_deposit: 12000, description: 'Executive private room with balcony', image_url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80' },
      { id: 'rm_zc_2', room_type: 'Sharing Room', monthly_rent: 8500, security_deposit: 8500, description: 'Double sharing with AC', image_url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=600&q=80' }
    ],
    amenities: ['am_ac', 'am_wifi', 'am_meals', 'am_parking', 'am_power', 'am_security', 'am_lift']
  },
  {
    id: 'prop_sv_boys_pg',
    owner_id: 'usr_own_2',
    name: 'Sri Venkateshwara Executive PG',
    tagline: 'Comfortable & Affordable Stay Near Hitec City',
    description: 'Executive boys PG located in Madhapur / Hitec City. Offering homestyle Andhra & North Indian food, air-conditioned rooms, biometric access, and washing machines.',
    category: 'Boys PG',
    property_type: 'PG',
    address_line: 'Hitec City Main Road, Madhapur',
    locality: 'Hitec City',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500081',
    latitude: 17.4483,
    longitude: 78.3915,
    approximate_location: 'Near Cyber Towers, Hitec City (~350m radius)',
    monthly_rent_from: 7200,
    security_deposit: 7200,
    notice_period_days: 30,
    food_type: 'Both',
    meals_included: 1,
    house_rules: 'Gate closes at 11:30 PM. Smoking not permitted.',
    status: 'approved',
    is_featured: 1,
    is_premium: 0,
    rating: 4.6,
    review_count: 520,
    images: [
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'
    ],
    rooms: [
      { id: 'rm_sv_1', room_type: 'Single Room', monthly_rent: 10000, security_deposit: 10000, description: 'Single room with attached bathroom', image_url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=600&q=80' },
      { id: 'rm_sv_2', room_type: 'Sharing Room', monthly_rent: 7200, security_deposit: 7200, description: 'Double sharing with AC and study table', image_url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80' }
    ],
    amenities: ['am_wifi', 'am_meals', 'am_power', 'am_laundry', 'am_security', 'am_ac']
  },
  {
    id: 'prop_stanza_hinjawadi',
    owner_id: 'usr_own_1',
    name: 'Stanza Living Hinjawadi Coliving',
    tagline: 'Techie Haven Near Rajiv Gandhi Infotech Park',
    description: 'Designer co-living accommodation in Hinjawadi Phase 1, Pune. Walking distance from major IT campuses (Infosys, Wipro, TCS). Fast Wi-Fi, games room, cafeteria, and housekeeping.',
    category: 'Co-living',
    property_type: 'Co-living',
    address_line: 'Hinjawadi Phase 1, Near Infosys Circle',
    locality: 'Hinjawadi',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411057',
    latitude: 18.5913,
    longitude: 73.7389,
    approximate_location: 'Near Infosys Circle, Hinjawadi Phase 1 (~300m radius)',
    monthly_rent_from: 8200,
    security_deposit: 8200,
    notice_period_days: 30,
    food_type: 'Both',
    meals_included: 1,
    house_rules: 'Community guidelines apply. Quiet hours after 11 PM.',
    status: 'approved',
    is_featured: 1,
    is_premium: 1,
    rating: 4.7,
    review_count: 710,
    images: [
      'https://images.unsplash.com/photo-1540518614846-7ede433c4550?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'
    ],
    rooms: [
      { id: 'rm_st_1', room_type: 'Single Room', monthly_rent: 13000, security_deposit: 13000, description: 'Solo private suite with high speed LAN', image_url: 'https://images.unsplash.com/photo-1540518614846-7ede433c4550?auto=format&fit=crop&w=600&q=80' },
      { id: 'rm_st_2', room_type: 'Sharing Room', monthly_rent: 8200, security_deposit: 8200, description: 'Twin sharing room with ergonomic chairs', image_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80' }
    ],
    amenities: ['am_ac', 'am_wifi', 'am_meals', 'am_parking', 'am_power', 'am_security', 'am_lift', 'am_cctv']
  },
  {
    id: 'prop_gokul_girls_pg',
    owner_id: 'usr_own_2',
    name: 'Gokul Girls Executive PG',
    tagline: 'Safe & Premium Women Living in Viman Nagar',
    description: 'Premium women PG in Viman Nagar near Symbiosis and Phoenix Marketcity. Includes 3-tier security, Wi-Fi, nutritious vegetarian food, and dedicated study spaces.',
    category: 'Girls PG',
    property_type: 'PG',
    address_line: 'Viman Nagar Central Road',
    locality: 'Viman Nagar',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411014',
    latitude: 18.5679,
    longitude: 73.9143,
    approximate_location: 'Near Phoenix Marketcity (~300m radius)',
    monthly_rent_from: 7800,
    security_deposit: 7800,
    notice_period_days: 30,
    food_type: 'Veg',
    meals_included: 1,
    house_rules: 'Female guests only. Entry by 10:30 PM.',
    status: 'approved',
    is_featured: 1,
    is_premium: 0,
    rating: 4.8,
    review_count: 490,
    images: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80'
    ],
    rooms: [
      { id: 'rm_gk_1', room_type: 'Single Room', monthly_rent: 11000, security_deposit: 11000, description: 'Private AC room for women students or professionals', image_url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80' },
      { id: 'rm_gk_2', room_type: 'Sharing Room', monthly_rent: 7800, security_deposit: 7800, description: 'Double sharing with attached bathroom', image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80' }
    ],
    amenities: ['am_wifi', 'am_meals', 'am_power', 'am_security', 'am_cctv', 'am_laundry']
  }
];

const insertProp = db.prepare(`
  INSERT OR REPLACE INTO properties (
    id, owner_id, name, tagline, description, category, property_type,
    address_line, locality, city, state, pincode, latitude, longitude,
    approximate_location, monthly_rent_from, security_deposit, notice_period_days,
    food_type, meals_included, house_rules, status, is_featured, is_premium,
    rating, review_count
  ) VALUES (
    @id, @owner_id, @name, @tagline, @description, @category, @property_type,
    @address_line, @locality, @city, @state, @pincode, @latitude, @longitude,
    @approximate_location, @monthly_rent_from, @security_deposit, @notice_period_days,
    @food_type, @meals_included, @house_rules, @status, @is_featured, @is_premium,
    @rating, @review_count
  )
`);

const insertImg = db.prepare(`INSERT OR REPLACE INTO property_images (id, property_id, image_url, is_cover, display_order) VALUES (?, ?, ?, ?, ?)`);
const insertRm = db.prepare(`INSERT OR REPLACE INTO rooms (id, property_id, room_type, monthly_rent, security_deposit, total_beds, available_beds, description, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
const insertAm = db.prepare(`INSERT OR IGNORE INTO property_amenities (id, property_id, amenity_id) VALUES (?, ?, ?)`);

for (const p of newProps) {
  insertProp.run(p);
  p.images.forEach((url, i) => insertImg.run('img_' + p.id + '_' + i, p.id, url, i === 0 ? 1 : 0, i));
  p.rooms.forEach(r => insertRm.run(r.id, p.id, r.room_type, r.monthly_rent, r.security_deposit, 10, 4, r.description, r.image_url));
  p.amenities.forEach(amId => insertAm.run('pa_' + p.id + '_' + amId, p.id, amId));
}

console.log('Seeded properties for Hyderabad and Pune successfully!');
console.log('Distinct cities now:', db.prepare('SELECT DISTINCT city FROM properties').all());
