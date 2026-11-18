import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'vasati.db');

// Ensure DB instance singleton
let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!dbInstance) {
    dbInstance = new Database(DB_PATH);
    dbInstance.pragma('journal_mode = WAL');
    dbInstance.pragma('foreign_keys = ON');
    initSchema(dbInstance);
    seedInitialData(dbInstance);
  }
  return dbInstance;
}

function initSchema(db: Database.Database) {
  db.exec(`
    -- Users Table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      role TEXT CHECK(role IN ('customer', 'owner', 'admin')) NOT NULL DEFAULT 'customer',
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Customer Profiles
    CREATE TABLE IF NOT EXISTS customer_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      college_or_company TEXT,
      emergency_contact TEXT,
      address TEXT,
      preferred_food TEXT DEFAULT 'Any',
      preferred_city TEXT DEFAULT 'Bengaluru',
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Owner Profiles
    CREATE TABLE IF NOT EXISTS owner_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      business_name TEXT,
      bank_account_no TEXT,
      bank_ifsc TEXT,
      upi_id TEXT,
      kyc_status TEXT CHECK(kyc_status IN ('verified', 'pending', 'rejected')) DEFAULT 'verified',
      kyc_doc_type TEXT,
      kyc_doc_url TEXT,
      commission_agreement_accepted INTEGER DEFAULT 1,
      commission_rate REAL DEFAULT 0.08,
      attribution_window_days INTEGER DEFAULT 30,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Properties Table
    CREATE TABLE IF NOT EXISTS properties (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      name TEXT NOT NULL,
      tagline TEXT,
      description TEXT,
      category TEXT CHECK(category IN ('Boys PG', 'Girls PG', 'Co-living', 'All PGs')) DEFAULT 'All PGs',
      property_type TEXT DEFAULT 'PG',
      address_line TEXT NOT NULL,
      locality TEXT NOT NULL,
      city TEXT NOT NULL DEFAULT 'Bengaluru',
      state TEXT NOT NULL DEFAULT 'Karnataka',
      pincode TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      approximate_location TEXT,
      monthly_rent_from INTEGER NOT NULL,
      security_deposit INTEGER NOT NULL DEFAULT 10000,
      notice_period_days INTEGER DEFAULT 30,
      food_type TEXT CHECK(food_type IN ('Veg', 'Non-Veg', 'Both', 'None')) DEFAULT 'Both',
      meals_included INTEGER DEFAULT 1,
      house_rules TEXT,
      status TEXT CHECK(status IN ('approved', 'pending', 'rejected')) DEFAULT 'approved',
      is_featured INTEGER DEFAULT 0,
      is_premium INTEGER DEFAULT 0,
      rating REAL DEFAULT 4.5,
      review_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(owner_id) REFERENCES users(id)
    );

    -- Property Images
    CREATE TABLE IF NOT EXISTS property_images (
      id TEXT PRIMARY KEY,
      property_id TEXT NOT NULL,
      image_url TEXT NOT NULL,
      caption TEXT,
      display_order INTEGER DEFAULT 0,
      is_cover INTEGER DEFAULT 0,
      FOREIGN KEY(property_id) REFERENCES properties(id) ON DELETE CASCADE
    );

    -- Rooms Table
    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      property_id TEXT NOT NULL,
      room_type TEXT NOT NULL, -- 'Single Room', 'Sharing Room', 'Triple Sharing'
      monthly_rent INTEGER NOT NULL,
      security_deposit INTEGER NOT NULL,
      total_beds INTEGER DEFAULT 10,
      available_beds INTEGER DEFAULT 5,
      description TEXT,
      image_url TEXT,
      FOREIGN KEY(property_id) REFERENCES properties(id) ON DELETE CASCADE
    );

    -- Amenities Master Table
    CREATE TABLE IF NOT EXISTS amenities (
      id TEXT PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      icon_name TEXT NOT NULL
    );

    -- Property Amenities Map
    CREATE TABLE IF NOT EXISTS property_amenities (
      id TEXT PRIMARY KEY,
      property_id TEXT NOT NULL,
      amenity_id TEXT NOT NULL,
      FOREIGN KEY(property_id) REFERENCES properties(id) ON DELETE CASCADE,
      FOREIGN KEY(amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
    );

    -- Customer Enquiries (Anti-Bypass Protected)
    CREATE TABLE IF NOT EXISTS enquiries (
      id TEXT PRIMARY KEY,
      enquiry_code TEXT UNIQUE NOT NULL,
      property_id TEXT NOT NULL,
      customer_id TEXT NOT NULL,
      owner_id TEXT NOT NULL,
      initial_message TEXT,
      move_in_target_date TEXT,
      room_type_interest TEXT,
      status TEXT CHECK(status IN ('open', 'responded', 'closed')) DEFAULT 'open',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(property_id) REFERENCES properties(id),
      FOREIGN KEY(customer_id) REFERENCES users(id),
      FOREIGN KEY(owner_id) REFERENCES users(id)
    );

    -- Scheduled Visits
    CREATE TABLE IF NOT EXISTS visits (
      id TEXT PRIMARY KEY,
      visit_code TEXT UNIQUE NOT NULL,
      property_id TEXT NOT NULL,
      customer_id TEXT NOT NULL,
      owner_id TEXT NOT NULL,
      visit_date TEXT NOT NULL,
      visit_time TEXT NOT NULL,
      status TEXT CHECK(status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')) DEFAULT 'pending',
      notes TEXT,
      approximate_address TEXT,
      unlocked_full_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(property_id) REFERENCES properties(id),
      FOREIGN KEY(customer_id) REFERENCES users(id),
      FOREIGN KEY(owner_id) REFERENCES users(id)
    );

    -- In-App Masked Messaging
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      enquiry_id TEXT,
      property_id TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      receiver_id TEXT NOT NULL,
      message TEXT NOT NULL,
      is_masked INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(sender_id) REFERENCES users(id),
      FOREIGN KEY(receiver_id) REFERENCES users(id)
    );

    -- Bookings (Full 10-stage lifecycle flow)
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      booking_code TEXT UNIQUE NOT NULL,
      property_id TEXT NOT NULL,
      room_id TEXT NOT NULL,
      customer_id TEXT NOT NULL,
      owner_id TEXT NOT NULL,
      room_type TEXT NOT NULL,
      duration_months INTEGER DEFAULT 1,
      move_in_date TEXT NOT NULL,
      monthly_rent INTEGER NOT NULL,
      duration_rent_total INTEGER NOT NULL,
      security_deposit INTEGER NOT NULL DEFAULT 0,
      maintenance_charge INTEGER NOT NULL DEFAULT 0,
      discount_amount INTEGER NOT NULL DEFAULT 0,
      total_amount INTEGER NOT NULL,
      status TEXT CHECK(status IN (
        'Pending',
        'Owner Accepted',
        'Payment Pending',
        'Confirmed',
        'Move-in Pending',
        'Checked In',
        'Completed',
        'Cancelled',
        'Refund Pending',
        'Refunded'
      )) DEFAULT 'Confirmed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(property_id) REFERENCES properties(id),
      FOREIGN KEY(room_id) REFERENCES rooms(id),
      FOREIGN KEY(customer_id) REFERENCES users(id),
      FOREIGN KEY(owner_id) REFERENCES users(id)
    );

    -- Booking Payments
    CREATE TABLE IF NOT EXISTS booking_payments (
      id TEXT PRIMARY KEY,
      booking_id TEXT NOT NULL,
      payment_code TEXT UNIQUE NOT NULL,
      amount INTEGER NOT NULL,
      payment_method TEXT NOT NULL, -- 'UPI', 'Credit/Debit Card', 'Net Banking', 'Paytm Wallet'
      payment_provider TEXT DEFAULT 'Razorpay / VASATI Secure Gateway',
      transaction_reference TEXT UNIQUE NOT NULL,
      status TEXT CHECK(status IN ('SUCCESS', 'PENDING', 'FAILED')) DEFAULT 'SUCCESS',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(booking_id) REFERENCES bookings(id)
    );

    -- VASATI Commission Ledger (8% owner-paid on 1st month rent)
    CREATE TABLE IF NOT EXISTS commissions (
      id TEXT PRIMARY KEY,
      booking_id TEXT UNIQUE NOT NULL,
      owner_id TEXT NOT NULL,
      base_first_month_rent INTEGER NOT NULL,
      commission_rate REAL DEFAULT 0.08,
      commission_amount INTEGER NOT NULL,
      owner_net_amount INTEGER NOT NULL,
      status TEXT CHECK(status IN ('PENDING', 'ACCRUED', 'SETTLED', 'CANCELLED')) DEFAULT 'ACCRUED',
      move_in_condition_met INTEGER DEFAULT 1,
      invoice_number TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(booking_id) REFERENCES bookings(id),
      FOREIGN KEY(owner_id) REFERENCES users(id)
    );

    -- Owner Settlements & Payouts
    CREATE TABLE IF NOT EXISTS owner_settlements (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      commission_id TEXT NOT NULL,
      gross_booking_amount INTEGER NOT NULL,
      commission_deducted INTEGER NOT NULL,
      payout_amount INTEGER NOT NULL,
      settlement_status TEXT CHECK(settlement_status IN ('PENDING', 'PROCESSED', 'FAILED')) DEFAULT 'PROCESSED',
      payout_method TEXT DEFAULT 'IMPS Bank Transfer',
      payout_reference TEXT,
      settled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(owner_id) REFERENCES users(id),
      FOREIGN KEY(commission_id) REFERENCES commissions(id)
    );

    -- Refunds Table
    CREATE TABLE IF NOT EXISTS refunds (
      id TEXT PRIMARY KEY,
      booking_id TEXT NOT NULL,
      amount INTEGER NOT NULL,
      reason TEXT,
      status TEXT CHECK(status IN ('PENDING', 'APPROVED', 'REJECTED', 'PROCESSED')) DEFAULT 'PENDING',
      requested_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      processed_at DATETIME,
      FOREIGN KEY(booking_id) REFERENCES bookings(id)
    );

    -- Customer & Owner Complaints
    CREATE TABLE IF NOT EXISTS complaints (
      id TEXT PRIMARY KEY,
      complaint_code TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL,
      property_id TEXT,
      booking_id TEXT,
      user_role TEXT DEFAULT 'customer',
      category TEXT NOT NULL,
      subject TEXT NOT NULL,
      description TEXT NOT NULL,
      priority TEXT DEFAULT 'Medium',
      status TEXT CHECK(status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED')) DEFAULT 'OPEN',
      resolution_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    -- Saved / Favorite Properties
    CREATE TABLE IF NOT EXISTS saved_properties (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      property_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, property_id),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(property_id) REFERENCES properties(id) ON DELETE CASCADE
    );

    -- Property Reviews
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      property_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      rating REAL NOT NULL,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(property_id) REFERENCES properties(id) ON DELETE CASCADE,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    -- Rent Reminders
    CREATE TABLE IF NOT EXISTS rent_reminders (
      id TEXT PRIMARY KEY,
      booking_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      due_date TEXT NOT NULL,
      amount INTEGER NOT NULL,
      status TEXT CHECK(status IN ('UPCOMING', 'PAID', 'OVERDUE')) DEFAULT 'UPCOMING',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(booking_id) REFERENCES bookings(id)
    );

    -- Complete Anti-Bypass & Audit Logs
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      action TEXT NOT NULL,
      actor_id TEXT NOT NULL,
      actor_role TEXT NOT NULL,
      details TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

function seedInitialData(db: Database.Database) {
  const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (existingUsers.count > 0) return;

  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, phone, role, avatar_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  // 1. Lakshminarayana G (Customer matching Reference UI)
  insertUser.run(
    'usr_cust_1',
    'Lakshminarayana G',
    'lakshmi@gmail.com',
    '+91 98450 12345',
    'customer',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
  );

  // 2. Owner Ramesh Sharma (Owner of Sri Sai PG & Green Comfort)
  insertUser.run(
    'usr_own_1',
    'Ramesh Sharma',
    'ramesh.pg@vasati.in',
    '+91 98200 88776',
    'owner',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
  );

  // 3. Owner Anita Reddy (Owner of Comfort Stay & Elite Living)
  insertUser.run(
    'usr_own_2',
    'Anita Reddy',
    'anita.stsys@vasati.in',
    '+91 97410 99882',
    'owner',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
  );

  // 4. Admin
  insertUser.run(
    'usr_adm_1',
    'VASATI Operations Admin',
    'admin@vasati.in',
    '+91 80 4000 9000',
    'admin',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80'
  );

  // Customer profile
  db.prepare(`
    INSERT INTO customer_profiles (id, user_id, college_or_company, emergency_contact, address, preferred_food, preferred_city)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    'cp_1',
    'usr_cust_1',
    'Infosys Technologies, Electronic City',
    '+91 98450 99999 (Father)',
    'Koramangala 4th Block, Bengaluru',
    'Veg',
    'Bengaluru'
  );

  // Owner profiles
  const insertOwner = db.prepare(`
    INSERT INTO owner_profiles (id, user_id, business_name, bank_account_no, bank_ifsc, upi_id, kyc_status, commission_agreement_accepted, commission_rate)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertOwner.run(
    'op_1',
    'usr_own_1',
    'Sri Sai Hospitality & Coliving Spaces',
    '918237461928',
    'HDFC0001234',
    'srisaipg@hdfcbank',
    'verified',
    1,
    0.08
  );

  insertOwner.run(
    'op_2',
    'usr_own_2',
    'Comfort Stays Bangalore Group',
    '501004928172',
    'ICIC0000456',
    'comfortstays@icici',
    'verified',
    1,
    0.08
  );

  // Master Amenities
  const amenitiesList = [
    { id: 'am_ac', key: 'ac', name: 'AC', icon_name: 'Snowflake' },
    { id: 'am_wifi', key: 'wifi', name: 'Wi-Fi', icon_name: 'Wifi' },
    { id: 'am_meals', key: 'meals', name: 'Meals', icon_name: 'Utensils' },
    { id: 'am_parking', key: 'parking', name: 'Parking', icon_name: 'SquareParking' },
    { id: 'am_power', key: 'power_backup', name: 'Power Backup', icon_name: 'Zap' },
    { id: 'am_laundry', key: 'laundry', name: 'Laundry', icon_name: 'Shirt' },
    { id: 'am_security', key: 'security', name: 'Security', icon_name: 'ShieldCheck' },
    { id: 'am_lift', key: 'lift', name: 'Lift', icon_name: 'ArrowUpDown' },
    { id: 'am_cctv', key: 'cctv', name: 'CCTV', icon_name: 'Video' },
    { id: 'am_tv', key: 'tv', name: 'Smart TV', icon_name: 'Tv' },
    { id: 'am_cleaning', key: 'cleaning', name: 'Daily Housekeeping', icon_name: 'Sparkles' },
    { id: 'am_fridge', key: 'refrigerator', name: 'Refrigerator', icon_name: 'Refrigerator' },
  ];

  const insertAmenity = db.prepare(`INSERT INTO amenities (id, key, name, icon_name) VALUES (?, ?, ?, ?)`);
  amenitiesList.forEach(a => insertAmenity.run(a.id, a.key, a.name, a.icon_name));

  // Properties list (featuring exact properties from Reference Image)
  const properties = [
    {
      id: 'prop_sri_sai',
      owner_id: 'usr_own_1',
      name: 'Sri Sai PG',
      tagline: 'Premium Living for Professionals & Students',
      description: 'Spacious and comfortable PG with all modern amenities. Safe environment for students and working professionals. Located just 5 minutes from Koramangala Sony World signal, offering high-speed fiber internet, 3 times nutritious food, biometric security, and 24x7 power backup.',
      category: 'Co-living',
      property_type: 'PG',
      address_line: 'Plot #14, 5th Block, Near Sony World Signal',
      locality: 'Koramangala',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560095',
      latitude: 12.9352,
      longitude: 77.6245,
      approximate_location: 'Near Sony World Signal, Koramangala 5th Block, Bengaluru (~400m radius)',
      monthly_rent_from: 8000,
      security_deposit: 8000,
      notice_period_days: 30,
      food_type: 'Both',
      meals_included: 1,
      house_rules: 'Gate closes at 11:30 PM. No smoking inside rooms. Guests allowed in common areas until 8:00 PM.',
      status: 'approved',
      is_featured: 1,
      is_premium: 1,
      rating: 4.7,
      review_count: 1240,
      amenities: ['am_ac', 'am_wifi', 'am_meals', 'am_parking', 'am_power', 'am_laundry', 'am_security', 'am_lift', 'am_cctv'],
      images: [
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1540518614846-7ede433c4550?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1000&q=80',
      ],
      rooms: [
        {
          id: 'rm_ss_1',
          room_type: 'Single Room',
          monthly_rent: 8000,
          security_deposit: 8000,
          total_beds: 12,
          available_beds: 4,
          description: 'Best for individuals who value privacy and peaceful study/work environment.',
          image_url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80'
        },
        {
          id: 'rm_ss_2',
          room_type: 'Sharing Room',
          monthly_rent: 6000,
          security_deposit: 6000,
          total_beds: 24,
          available_beds: 6,
          description: 'Double sharing with dedicated study table, wardrobe, and attached washroom.',
          image_url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=600&q=80'
        },
        {
          id: 'rm_ss_3',
          room_type: 'Triple Sharing',
          monthly_rent: 5000,
          security_deposit: 5000,
          total_beds: 18,
          available_beds: 8,
          description: 'Spacious triple sharing room with individual lockers and ventilation.',
          image_url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80'
        }
      ]
    },
    {
      id: 'prop_green_comfort',
      owner_id: 'usr_own_1',
      name: 'Green Comfort PG',
      tagline: 'Modern, Peaceful Stay Near Metro',
      description: 'Green Comfort PG is nestled in the serene residential streets of Indiranagar 100ft Road. Features premium wooden furnishings, air conditioning, daily housekeeping, organic home-cooked meals, and a private terrace garden for community gatherings.',
      category: 'Co-living',
      property_type: 'PG',
      address_line: '88, 12th Main Road, HAL 2nd Stage',
      locality: 'Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
      latitude: 12.9784,
      longitude: 77.6408,
      approximate_location: 'Near Indiranagar Metro Station (~500m radius)',
      monthly_rent_from: 7500,
      security_deposit: 7500,
      notice_period_days: 30,
      food_type: 'Both',
      meals_included: 1,
      house_rules: 'Visitors allowed until 9:00 PM. Alcohol strictly prohibited. Quiet hours after 11:00 PM.',
      status: 'approved',
      is_featured: 1,
      is_premium: 0,
      rating: 4.6,
      review_count: 856,
      amenities: ['am_ac', 'am_wifi', 'am_meals', 'am_parking', 'am_laundry', 'am_security', 'am_lift', 'am_power'],
      images: [
        'https://images.unsplash.com/photo-1540518614846-7ede433c4550?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80',
      ],
      rooms: [
        {
          id: 'rm_gc_1',
          room_type: 'Single Room',
          monthly_rent: 11000,
          security_deposit: 11000,
          total_beds: 8,
          available_beds: 2,
          description: 'Air-conditioned single room with private balcony.',
          image_url: 'https://images.unsplash.com/photo-1540518614846-7ede433c4550?auto=format&fit=crop&w=600&q=80'
        },
        {
          id: 'rm_gc_2',
          room_type: 'Sharing Room',
          monthly_rent: 7500,
          security_deposit: 7500,
          total_beds: 16,
          available_beds: 4,
          description: 'Double sharing room with twin beds and air conditioning.',
          image_url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80'
        }
      ]
    },
    {
      id: 'prop_comfort_stay',
      owner_id: 'usr_own_2',
      name: 'Comfort Stay PG',
      tagline: 'Budget Friendly & High Speed Internet',
      description: 'Comfort Stay PG is situated in HSR Layout Sector 2, perfect for IT professionals and startup founders working along Outer Ring Road. Fast 300 Mbps Wi-Fi, hygienic food, and biometric security.',
      category: 'Boys PG',
      property_type: 'PG',
      address_line: 'Sector 2, 27th Main, HSR Layout',
      locality: 'HSR Layout',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560102',
      latitude: 12.9116,
      longitude: 77.6474,
      approximate_location: 'Near HSR Club & BDA Complex (~350m radius)',
      monthly_rent_from: 7000,
      security_deposit: 7000,
      notice_period_days: 30,
      food_type: 'Veg',
      meals_included: 1,
      house_rules: 'Quiet hours after 10:30 PM. Weekly room inspections.',
      status: 'approved',
      is_featured: 1,
      is_premium: 0,
      rating: 4.5,
      review_count: 723,
      amenities: ['am_wifi', 'am_meals', 'am_parking', 'am_power', 'am_security', 'am_laundry'],
      images: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80',
      ],
      rooms: [
        {
          id: 'rm_cs_1',
          room_type: 'Single Room',
          monthly_rent: 9500,
          security_deposit: 9500,
          total_beds: 10,
          available_beds: 3,
          description: 'Single executive room with work desk.',
          image_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80'
        },
        {
          id: 'rm_cs_2',
          room_type: 'Sharing Room',
          monthly_rent: 7000,
          security_deposit: 7000,
          total_beds: 20,
          available_beds: 5,
          description: 'Comfortable twin sharing with high speed internet.',
          image_url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=600&q=80'
        }
      ]
    },
    {
      id: 'prop_elite_living',
      owner_id: 'usr_own_2',
      name: 'Elite Living Co-living',
      tagline: 'Luxury Tech-Park Residence',
      description: 'Luxury co-living space in Whitefield, minutes from ITPL and Brigade Tech Gardens. Features swimming pool, fitness gym, gaming lounge, cafe, and premium chef-prepared meals.',
      category: 'Co-living',
      property_type: 'Co-living',
      address_line: 'Near ITPL Gate 3, Whitefield Main Rd',
      locality: 'Whitefield',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560066',
      latitude: 12.9863,
      longitude: 77.7338,
      approximate_location: 'Near ITPL Gate 3 (~300m radius)',
      monthly_rent_from: 9500,
      security_deposit: 12000,
      notice_period_days: 45,
      food_type: 'Both',
      meals_included: 1,
      house_rules: 'Pet friendly in designated floors. ID card mandatory at main reception.',
      status: 'approved',
      is_featured: 1,
      is_premium: 1,
      rating: 4.8,
      review_count: 940,
      amenities: ['am_ac', 'am_wifi', 'am_meals', 'am_parking', 'am_power', 'am_laundry', 'am_security', 'am_lift', 'am_cctv'],
      images: [
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80',
      ],
      rooms: [
        {
          id: 'rm_el_1',
          room_type: 'Single Room',
          monthly_rent: 14000,
          security_deposit: 15000,
          total_beds: 15,
          available_beds: 2,
          description: 'Luxury studio bedroom with workstation and mini-fridge.',
          image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80'
        },
        {
          id: 'rm_el_2',
          room_type: 'Sharing Room',
          monthly_rent: 9500,
          security_deposit: 10000,
          total_beds: 30,
          available_beds: 7,
          description: 'Premium twin sharing with attached designer bathroom.',
          image_url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80'
        }
      ]
    },
    {
      id: 'prop_sannidhi_ladies',
      owner_id: 'usr_own_2',
      name: 'Sannidhi Ladies PG',
      tagline: 'Safe & Homely Stay for Women',
      description: 'Exclusive, highly secure women PG in BTM Layout 2nd Stage with female warden, CCTV surveillance on all corridors, biometric entrance, healthy South & North Indian food, and proximity to bus stand.',
      category: 'Girls PG',
      property_type: 'PG',
      address_line: '16th Main, 7th Cross, BTM 2nd Stage',
      locality: 'BTM Layout',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560076',
      latitude: 12.9166,
      longitude: 77.6101,
      approximate_location: 'Near Udupi Garden Signal, BTM 2nd Stage (~250m radius)',
      monthly_rent_from: 6800,
      security_deposit: 6800,
      notice_period_days: 30,
      food_type: 'Veg',
      meals_included: 1,
      house_rules: 'Female guests only. Entry closes at 10:30 PM. Parents permitted during day hours.',
      status: 'approved',
      is_featured: 0,
      is_premium: 0,
      rating: 4.7,
      review_count: 640,
      amenities: ['am_wifi', 'am_meals', 'am_power', 'am_laundry', 'am_security', 'am_lift', 'am_cctv'],
      images: [
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1000&q=80',
      ],
      rooms: [
        {
          id: 'rm_sl_1',
          room_type: 'Single Room',
          monthly_rent: 8500,
          security_deposit: 8500,
          total_beds: 10,
          available_beds: 1,
          description: 'Cozy private room for women students or working executives.',
          image_url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80'
        },
        {
          id: 'rm_sl_2',
          room_type: 'Sharing Room',
          monthly_rent: 6800,
          security_deposit: 6800,
          total_beds: 20,
          available_beds: 4,
          description: 'Spacious double sharing with individual wardrobes.',
          image_url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=80'
        }
      ]
    }
  ];

  const insertProp = db.prepare(`
    INSERT INTO properties (
      id, owner_id, name, tagline, description, category, property_type,
      address_line, locality, city, state, pincode, latitude, longitude,
      approximate_location, monthly_rent_from, security_deposit, notice_period_days,
      food_type, meals_included, house_rules, status, is_featured, is_premium, rating, review_count
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertImg = db.prepare(`
    INSERT INTO property_images (id, property_id, image_url, caption, display_order, is_cover)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertRoom = db.prepare(`
    INSERT INTO rooms (id, property_id, room_type, monthly_rent, security_deposit, total_beds, available_beds, description, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertPropAmenity = db.prepare(`
    INSERT INTO property_amenities (id, property_id, amenity_id)
    VALUES (?, ?, ?)
  `);

  properties.forEach(p => {
    insertProp.run(
      p.id, p.owner_id, p.name, p.tagline, p.description, p.category, p.property_type,
      p.address_line, p.locality, p.city, p.state, p.pincode, p.latitude, p.longitude,
      p.approximate_location, p.monthly_rent_from, p.security_deposit, p.notice_period_days,
      p.food_type, p.meals_included, p.house_rules, p.status, p.is_featured, p.is_premium, p.rating, p.review_count
    );

    p.images.forEach((url, idx) => {
      insertImg.run(`${p.id}_img_${idx}`, p.id, url, `${p.name} Photo ${idx + 1}`, idx, idx === 0 ? 1 : 0);
    });

    p.rooms.forEach(r => {
      insertRoom.run(r.id, p.id, r.room_type, r.monthly_rent, r.security_deposit, r.total_beds, r.available_beds, r.description, r.image_url);
    });

    p.amenities.forEach(amId => {
      insertPropAmenity.run(`${p.id}_${amId}`, p.id, amId);
    });
  });

  // Seed sample booking for user "Lakshminarayana G" matching Screen 6 & 7 in reference image:
  // "Sri Sai PG", Single Room, 3 Months, Monthly Rent: ₹8,000, Total Amount: ₹24,000
  const bookingId = 'bk_ref_001';
  db.prepare(`
    INSERT INTO bookings (
      id, booking_code, property_id, room_id, customer_id, owner_id,
      room_type, duration_months, move_in_date, monthly_rent, duration_rent_total,
      security_deposit, maintenance_charge, discount_amount, total_amount, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    bookingId,
    'BK-VAS-2026-8812',
    'prop_sri_sai',
    'rm_ss_1',
    'usr_cust_1',
    'usr_own_1',
    'Single Room',
    3,
    '2026-12-01',
    8000,
    24000,
    8000,
    0,
    0,
    24000,
    'Confirmed'
  );

  // Seed payment record
  db.prepare(`
    INSERT INTO booking_payments (
      id, booking_id, payment_code, amount, payment_method, payment_provider, transaction_reference, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'pay_001',
    bookingId,
    'PAY-VAS-9817',
    24000,
    'UPI (Google Pay)',
    'Razorpay / VASATI Payment Gateway',
    'TXN_UPI_981726451029',
    'SUCCESS'
  );

  // Seed commission: 8% on first month's agreed rent (₹8,000 * 0.08 = ₹640)
  // Owner amount = ₹8,000 - ₹640 = ₹7,360 (+ remaining months)
  const firstMonthRent = 8000;
  const commissionAmt = Math.round(firstMonthRent * 0.08); // 640
  const ownerNet = 24000 - commissionAmt; // 23,360

  db.prepare(`
    INSERT INTO commissions (
      id, booking_id, owner_id, base_first_month_rent, commission_rate, commission_amount, owner_net_amount, status, move_in_condition_met, invoice_number
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'com_001',
    bookingId,
    'usr_own_1',
    firstMonthRent,
    0.08,
    commissionAmt,
    ownerNet,
    'SETTLED',
    1,
    'INV-VAS-2026-0042'
  );

  // Seed owner settlement
  db.prepare(`
    INSERT INTO owner_settlements (
      id, owner_id, commission_id, gross_booking_amount, commission_deducted, payout_amount, settlement_status, payout_method, payout_reference
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'set_001',
    'usr_own_1',
    'com_001',
    24000,
    commissionAmt,
    ownerNet,
    'PROCESSED',
    'IMPS Bank Transfer (HDFC Bank)',
    'IMPS202611189921'
  );

  // Seed sample visit
  db.prepare(`
    INSERT INTO visits (
      id, visit_code, property_id, customer_id, owner_id, visit_date, visit_time, status, notes, approximate_address, unlocked_full_address
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'vst_001',
    'VST-VAS-5519',
    'prop_sri_sai',
    'usr_cust_1',
    'usr_own_1',
    '2026-11-20',
    '11:00 AM',
    'approved',
    'Customer wants to check single room ventilation and study table size.',
    'Near Sony World Signal, Koramangala 5th Block (~400m)',
    'Plot #14, 5th Block, Behind Canara Bank, Near Sony World Signal, Koramangala, Bengaluru'
  );

  // Seed sample enquiry & conversation
  db.prepare(`
    INSERT INTO enquiries (
      id, enquiry_code, property_id, customer_id, owner_id, initial_message, move_in_target_date, room_type_interest, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'enq_001',
    'ENQ-VAS-7731',
    'prop_sri_sai',
    'usr_cust_1',
    'usr_own_1',
    'Hi, is the single room available from December 1st?',
    '2026-12-01',
    'Single Room',
    'responded'
  );

  db.prepare(`
    INSERT INTO conversations (id, enquiry_id, property_id, sender_id, receiver_id, message, is_masked)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    'msg_001',
    'enq_001',
    'prop_sri_sai',
    'usr_cust_1',
    'usr_own_1',
    'Hello, is the single room with attached bathroom available from December 1st?',
    1
  );

  db.prepare(`
    INSERT INTO conversations (id, enquiry_id, property_id, sender_id, receiver_id, message, is_masked)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    'msg_002',
    'enq_001',
    'prop_sri_sai',
    'usr_own_1',
    'usr_cust_1',
    'Yes Lakshminarayana, we have 2 single rooms available on the 2nd floor with balcony. You are welcome to book a visit!',
    1
  );

  // Seed sample reviews
  db.prepare(`
    INSERT INTO reviews (id, property_id, user_id, rating, comment)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    'rev_001',
    'prop_sri_sai',
    'usr_cust_1',
    5.0,
    'Clean, spacious room and very supportive caretaker. Food quality is excellent with hot rotis and sambar!'
  );

  // Seed rent reminder
  db.prepare(`
    INSERT INTO rent_reminders (id, booking_id, user_id, due_date, amount, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    'rem_001',
    bookingId,
    'usr_cust_1',
    '2026-12-01',
    8000,
    'UPCOMING'
  );

  // Seed complaints
  db.prepare(`
    INSERT INTO complaints (
      id, complaint_code, user_id, property_id, booking_id, user_role, category, subject, description, priority, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'cmp_001',
    'CMP-VAS-104',
    'usr_cust_1',
    'prop_sri_sai',
    bookingId,
    'customer',
    'Maintenance',
    'Wi-Fi Speed in 2nd Floor Room',
    'The 5GHz band disconnects occasionally during peak evening hours (8 PM - 10 PM). Requesting router restart or repeater.',
    'Low',
    'OPEN'
  );

  // Seed audit logs
  db.prepare(`
    INSERT INTO audit_logs (id, entity_type, entity_id, action, actor_id, actor_role, details)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    'log_001',
    'Booking',
    bookingId,
    'BOOKING_CONFIRMED',
    'usr_cust_1',
    'customer',
    'Booking BK-VAS-2026-8812 confirmed with online payment of ₹24,000 for 3 months.'
  );

  db.prepare(`
    INSERT INTO audit_logs (id, entity_type, entity_id, action, actor_id, actor_role, details)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    'log_002',
    'Commission',
    'com_001',
    'COMMISSION_ACCRUED',
    'system',
    'system',
    'VASATI commission of ₹640 (8% on first month rent ₹8,000) accrued for owner usr_own_1.'
  );
}

