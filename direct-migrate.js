#!/usr/bin/env node

import pkg from 'pg';
const { Pool } = pkg;

// Source database (current)
const sourcePool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Target database (new destination)
const targetPool = new Pool({
  connectionString: 'postgresql://Travelex1_owner:npg_Gdv6fZW7mjzt@ep-long-glade-a20tplti-pooler.eu-central-1.aws.neon.tech/Travelex1?sslmode=require'
});

// Table order for migration (respecting foreign key dependencies)
const TABLES = ['users', 'destinations', 'bookings', 'reviews', 'activity_logs', 'sessions'];

async function createTablesDirectly() {
  console.log('Creating tables directly on target database...');
  
  const createTableQueries = [
    // Sessions table
    `CREATE TABLE IF NOT EXISTS sessions (
      sid VARCHAR PRIMARY KEY,
      sess JSONB NOT NULL,
      expire TIMESTAMP NOT NULL
    );`,
    `CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions (expire);`,
    
    // Users table
    `CREATE TABLE IF NOT EXISTS users (
      id VARCHAR PRIMARY KEY,
      username VARCHAR UNIQUE,
      email VARCHAR UNIQUE,
      password VARCHAR,
      first_name VARCHAR,
      last_name VARCHAR,
      profile_image_url VARCHAR,
      role VARCHAR DEFAULT 'user',
      last_login_at TIMESTAMP,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    );`,
    
    // Destinations table
    `CREATE TABLE IF NOT EXISTS destinations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      country VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      short_description VARCHAR(500),
      image_url VARCHAR(500),
      price NUMERIC(10,2) NOT NULL,
      duration INTEGER NOT NULL,
      distance_km NUMERIC(8,2),
      rating NUMERIC(3,2) DEFAULT 0,
      review_count INTEGER DEFAULT 0,
      max_guests INTEGER DEFAULT 2,
      is_active BOOLEAN DEFAULT true,
      features JSONB,
      itinerary JSONB,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now(),
      original_price NUMERIC(10,2),
      discount_percentage INTEGER DEFAULT 0,
      promo_tag VARCHAR(50),
      promo_expiry TIMESTAMP,
      discount_type VARCHAR(30) DEFAULT 'percentage',
      seasonal_tag VARCHAR(50),
      flash_sale BOOLEAN DEFAULT false,
      flash_sale_end TIMESTAMP,
      coupon_code VARCHAR(20),
      group_discount_min INTEGER DEFAULT 0,
      loyalty_discount INTEGER DEFAULT 0,
      bundle_deal JSONB
    );`,
    
    // Bookings table
    `CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR NOT NULL REFERENCES users(id),
      destination_id INTEGER NOT NULL REFERENCES destinations(id),
      check_in DATE NOT NULL,
      check_out DATE NOT NULL,
      guests INTEGER NOT NULL,
      travel_class VARCHAR(50) DEFAULT 'economy',
      upgrades JSONB,
      total_amount NUMERIC(10,2) NOT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      payment_status VARCHAR(50) DEFAULT 'pending',
      stripe_payment_intent_id VARCHAR,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now(),
      original_amount NUMERIC(10,2),
      applied_coupon_code VARCHAR(20),
      coupon_discount NUMERIC(10,2) DEFAULT 0
    );`,
    
    // Reviews table
    `CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      destination_id INTEGER NOT NULL REFERENCES destinations(id),
      user_id VARCHAR REFERENCES users(id),
      rating INTEGER NOT NULL,
      title VARCHAR(255) NOT NULL,
      comment TEXT NOT NULL,
      trip_date DATE,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    );`,
    
    // Activity logs table
    `CREATE TABLE IF NOT EXISTS activity_logs (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR REFERENCES users(id),
      action VARCHAR(255) NOT NULL,
      description TEXT,
      metadata JSONB,
      created_at TIMESTAMP DEFAULT now()
    );`
  ];
  
  for (const query of createTableQueries) {
    try {
      await targetPool.query(query);
    } catch (error) {
      console.error('Error creating table:', error.message);
      throw error;
    }
  }
  
  console.log('Tables created successfully');
}

async function exportAndImportData(tableName) {
  console.log(`Migrating ${tableName}...`);
  
  // Export data from source
  const exportQuery = `SELECT * FROM ${tableName} ORDER BY 1`;
  const sourceResult = await sourcePool.query(exportQuery);
  const data = sourceResult.rows;
  
  console.log(`Found ${data.length} records in ${tableName}`);
  
  if (data.length === 0) {
    console.log(`No data to migrate for ${tableName}`);
    return;
  }
  
  // Clear existing data in target (if any)
  await targetPool.query(`TRUNCATE TABLE ${tableName} RESTART IDENTITY CASCADE`);
  
  // Import data to target
  const columns = Object.keys(data[0]);
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
  const columnNames = columns.join(', ');
  
  const insertQuery = `INSERT INTO ${tableName} (${columnNames}) VALUES (${placeholders})`;
  
  let inserted = 0;
  for (const row of data) {
    try {
      const values = columns.map(col => row[col]);
      await targetPool.query(insertQuery, values);
      inserted++;
    } catch (error) {
      console.error(`Error inserting row in ${tableName}:`, error.message);
      console.error('Row data:', JSON.stringify(row, null, 2));
    }
  }
  
  console.log(`Successfully migrated ${inserted}/${data.length} records to ${tableName}`);
}

async function updateSequences() {
  console.log('Updating sequences...');
  
  const sequenceQueries = [
    "SELECT setval('destinations_id_seq', (SELECT COALESCE(MAX(id), 1) FROM destinations), false);",
    "SELECT setval('bookings_id_seq', (SELECT COALESCE(MAX(id), 1) FROM bookings), false);",
    "SELECT setval('reviews_id_seq', (SELECT COALESCE(MAX(id), 1) FROM reviews), false);",
    "SELECT setval('activity_logs_id_seq', (SELECT COALESCE(MAX(id), 1) FROM activity_logs), false);"
  ];
  
  for (const query of sequenceQueries) {
    try {
      await targetPool.query(query);
      console.log('Updated sequence successfully');
    } catch (error) {
      console.log(`Note: ${error.message}`);
    }
  }
}

async function verifyMigration() {
  console.log('\nVerifying migration...');
  
  for (const table of TABLES) {
    try {
      const sourceCount = await sourcePool.query(`SELECT COUNT(*) FROM ${table}`);
      const targetCount = await targetPool.query(`SELECT COUNT(*) FROM ${table}`);
      
      const sourceRows = parseInt(sourceCount.rows[0].count);
      const targetRows = parseInt(targetCount.rows[0].count);
      
      console.log(`${table}: Source=${sourceRows}, Target=${targetRows} ${sourceRows === targetRows ? '✓' : '✗'}`);
    } catch (error) {
      console.log(`${table}: Error checking - ${error.message}`);
    }
  }
}

async function migrate() {
  try {
    console.log('Starting direct database migration...');
    console.log('Source:', process.env.DATABASE_URL?.substring(0, 50) + '...');
    console.log('Target: postgresql://Travelex1_owner:***@ep-long-glade-a20tplti-pooler.eu-central-1.aws.neon.tech/Travelex1');
    
    // Test connections
    await sourcePool.query('SELECT 1');
    console.log('Source database connected ✓');
    
    await targetPool.query('SELECT 1');
    console.log('Target database connected ✓');
    
    // Create schema directly
    await createTablesDirectly();
    
    // Migrate data for each table
    for (const table of TABLES) {
      await exportAndImportData(table);
    }
    
    // Update sequences
    await updateSequences();
    
    // Verify migration
    await verifyMigration();
    
    console.log('\nMigration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await sourcePool.end();
    await targetPool.end();
  }
}

// Run migration
migrate().catch(console.error);