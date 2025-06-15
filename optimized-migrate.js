#!/usr/bin/env node

import pkg from 'pg';
const { Pool } = pkg;

// Source database (current)
const sourcePool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 30000
});

// Target database (new destination)
const targetPool = new Pool({
  connectionString: 'postgresql://Travelex1_owner:npg_Gdv6fZW7mjzt@ep-long-glade-a20tplti-pooler.eu-central-1.aws.neon.tech/Travelex1?sslmode=require',
  max: 5,
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 30000
});

// Table order for migration (respecting foreign key dependencies)
const TABLES = ['sessions', 'users', 'destinations', 'bookings', 'reviews', 'activity_logs'];

async function createSchemaOnTarget() {
  console.log('Creating schema on target database...');
  
  const queries = [
    // Drop existing tables if they exist (for clean migration)
    'DROP TABLE IF EXISTS activity_logs CASCADE;',
    'DROP TABLE IF EXISTS reviews CASCADE;',
    'DROP TABLE IF EXISTS bookings CASCADE;',
    'DROP TABLE IF EXISTS destinations CASCADE;',
    'DROP TABLE IF EXISTS users CASCADE;',
    'DROP TABLE IF EXISTS sessions CASCADE;',
    
    // Create sessions table
    `CREATE TABLE sessions (
      sid VARCHAR PRIMARY KEY,
      sess JSONB NOT NULL,
      expire TIMESTAMP NOT NULL
    );`,
    'CREATE INDEX IDX_session_expire ON sessions (expire);',
    
    // Create users table
    `CREATE TABLE users (
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
    
    // Create destinations table
    `CREATE TABLE destinations (
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
    
    // Create bookings table
    `CREATE TABLE bookings (
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
    
    // Create reviews table
    `CREATE TABLE reviews (
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
    
    // Create activity_logs table
    `CREATE TABLE activity_logs (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR REFERENCES users(id),
      action VARCHAR(255) NOT NULL,
      description TEXT,
      metadata JSONB,
      created_at TIMESTAMP DEFAULT now()
    );`
  ];
  
  for (const query of queries) {
    try {
      await targetPool.query(query);
    } catch (error) {
      console.error('Schema creation error:', error.message);
      throw error;
    }
  }
  
  console.log('Schema created successfully');
}

async function migrateTableData(tableName) {
  console.log(`Migrating ${tableName}...`);
  
  try {
    // Get data from source
    const sourceData = await sourcePool.query(`SELECT * FROM ${tableName} ORDER BY 1`);
    const rows = sourceData.rows;
    
    console.log(`Found ${rows.length} records in ${tableName}`);
    
    if (rows.length === 0) {
      console.log(`No data to migrate for ${tableName}`);
      return;
    }
    
    // Batch insert for better performance
    const batchSize = 50;
    let inserted = 0;
    
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      
      for (const row of batch) {
        try {
          const columns = Object.keys(row);
          const values = Object.values(row);
          const placeholders = columns.map((_, idx) => `$${idx + 1}`).join(', ');
          const columnNames = columns.join(', ');
          
          const insertQuery = `INSERT INTO ${tableName} (${columnNames}) VALUES (${placeholders})`;
          await targetPool.query(insertQuery, values);
          inserted++;
        } catch (error) {
          console.error(`Error inserting row ${i + 1} in ${tableName}:`, error.message);
        }
      }
      
      console.log(`Progress: ${Math.min(i + batchSize, rows.length)}/${rows.length} records processed`);
    }
    
    console.log(`Successfully migrated ${inserted}/${rows.length} records to ${tableName}`);
    
  } catch (error) {
    console.error(`Error migrating ${tableName}:`, error.message);
    throw error;
  }
}

async function updateSequences() {
  console.log('Updating sequences...');
  
  const sequenceUpdates = [
    "SELECT setval('destinations_id_seq', (SELECT COALESCE(MAX(id), 1) FROM destinations));",
    "SELECT setval('bookings_id_seq', (SELECT COALESCE(MAX(id), 1) FROM bookings));",
    "SELECT setval('reviews_id_seq', (SELECT COALESCE(MAX(id), 1) FROM reviews));",
    "SELECT setval('activity_logs_id_seq', (SELECT COALESCE(MAX(id), 1) FROM activity_logs));"
  ];
  
  for (const query of sequenceUpdates) {
    try {
      await targetPool.query(query);
    } catch (error) {
      console.log(`Sequence update note: ${error.message}`);
    }
  }
  
  console.log('Sequences updated');
}

async function verifyMigration() {
  console.log('\nVerifying migration results...');
  
  const results = [];
  
  for (const table of TABLES) {
    try {
      const [sourceResult, targetResult] = await Promise.all([
        sourcePool.query(`SELECT COUNT(*) FROM ${table}`),
        targetPool.query(`SELECT COUNT(*) FROM ${table}`)
      ]);
      
      const sourceCount = parseInt(sourceResult.rows[0].count);
      const targetCount = parseInt(targetResult.rows[0].count);
      const status = sourceCount === targetCount ? '✓' : '✗';
      
      results.push({ table, sourceCount, targetCount, status });
      console.log(`${table}: Source=${sourceCount}, Target=${targetCount} ${status}`);
      
    } catch (error) {
      results.push({ table, error: error.message });
      console.log(`${table}: Verification error - ${error.message}`);
    }
  }
  
  return results;
}

async function migrate() {
  const startTime = Date.now();
  
  try {
    console.log('Starting optimized database migration...');
    console.log('Source: Current PostgreSQL database');
    console.log('Target: postgresql://Travelex1_owner:***@ep-long-glade-a20tplti-pooler.eu-central-1.aws.neon.tech/Travelex1');
    
    // Test connections
    console.log('Testing database connections...');
    await Promise.all([
      sourcePool.query('SELECT 1'),
      targetPool.query('SELECT 1')
    ]);
    console.log('Database connections established ✓');
    
    // Create schema
    await createSchemaOnTarget();
    
    // Migrate data for each table in order
    for (const table of TABLES) {
      await migrateTableData(table);
    }
    
    // Update sequences
    await updateSequences();
    
    // Verify migration
    const results = await verifyMigration();
    
    const duration = Math.round((Date.now() - startTime) / 1000);
    console.log(`\nMigration completed in ${duration} seconds`);
    
    // Check if all tables migrated successfully
    const failed = results.filter(r => r.status === '✗' || r.error);
    if (failed.length === 0) {
      console.log('All data migrated successfully! ✓');
    } else {
      console.log(`${failed.length} table(s) had issues:`, failed);
    }
    
  } catch (error) {
    console.error('Migration failed:', error.message);
    throw error;
  } finally {
    await sourcePool.end();
    await targetPool.end();
  }
}

migrate().catch(console.error);