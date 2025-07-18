import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

// Database connection configuration
const DATABASE_URL = 'postgresql://sai_j16q_user:Ktz9XhfvegcunhDBccYng71gUSfvoFvY@dpg-d1ss8amr433s73emf0l0-a.singapore-postgres.render.com/sai_j16q';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Helper function to parse CSV line with proper handling of quoted fields
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  let i = 0;
  
  while (i < line.length) {
    const char = line[i];
    
    if (char === '"' && !inQuotes) {
      inQuotes = true;
    } else if (char === '"' && inQuotes) {
      if (i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++; // Skip the next quote
      } else {
        inQuotes = false;
      }
    } else if (char === '\t' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
    i++;
  }
  
  result.push(current);
  return result;
}

// Helper function to clean values
function cleanValue(value) {
  if (!value || value === '\\N' || value === 'NULL' || value === 'null') {
    return null;
  }
  return value.trim();
}

// Helper function to parse JSON safely
function parseJSON(value) {
  if (!value || value === '\\N' || value === 'NULL') {
    return null;
  }
  try {
    // Clean up the JSON string by replacing single quotes with double quotes
    const cleaned = value.replace(/'/g, '"');
    return JSON.parse(cleaned);
  } catch (e) {
    console.log('Warning: Could not parse JSON:', value);
    return null;
  }
}

// Function to create database tables
async function createTables() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Creating database tables...');
    
    // Drop existing tables in correct order (respect foreign key constraints)
    await client.query('DROP TABLE IF EXISTS activity_logs CASCADE');
    await client.query('DROP TABLE IF EXISTS reviews CASCADE');
    await client.query('DROP TABLE IF EXISTS bookings CASCADE');
    await client.query('DROP TABLE IF EXISTS destinations CASCADE');
    await client.query('DROP TABLE IF EXISTS users CASCADE');
    await client.query('DROP TABLE IF EXISTS sessions CASCADE');
    
    // Create sessions table
    await client.query(`
      CREATE TABLE sessions (
        sid VARCHAR PRIMARY KEY,
        sess JSONB NOT NULL,
        expire TIMESTAMP NOT NULL
      )
    `);
    
    // Create index for sessions
    await client.query(`
      CREATE INDEX "IDX_session_expire" ON sessions(expire)
    `);
    
    // Create users table
    await client.query(`
      CREATE TABLE users (
        id VARCHAR PRIMARY KEY NOT NULL,
        username VARCHAR UNIQUE,
        email VARCHAR UNIQUE,
        password VARCHAR,
        first_name VARCHAR,
        last_name VARCHAR,
        profile_image_url VARCHAR,
        role VARCHAR DEFAULT 'user',
        last_login_at TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create destinations table
    await client.query(`
      CREATE TABLE destinations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        country VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        short_description VARCHAR(500),
        image_url VARCHAR(500) UNIQUE,
        price DECIMAL(10, 2) NOT NULL,
        original_price DECIMAL(10, 2),
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
        bundle_deal JSONB,
        duration INTEGER NOT NULL,
        distance_km DECIMAL(8, 2),
        rating DECIMAL(3, 2) DEFAULT 0,
        review_count INTEGER DEFAULT 0,
        max_guests INTEGER DEFAULT 2,
        is_active BOOLEAN DEFAULT true,
        features JSONB,
        itinerary JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create bookings table
    await client.query(`
      CREATE TABLE bookings (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR NOT NULL REFERENCES users(id),
        destination_id INTEGER NOT NULL REFERENCES destinations(id),
        check_in DATE NOT NULL,
        check_out DATE NOT NULL,
        guests INTEGER NOT NULL,
        travel_class VARCHAR(50) DEFAULT 'economy',
        upgrades JSONB,
        total_amount DECIMAL(10, 2) NOT NULL,
        original_amount DECIMAL(10, 2),
        applied_coupon_code VARCHAR(20),
        coupon_discount DECIMAL(10, 2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'pending',
        payment_status VARCHAR(50) DEFAULT 'pending',
        stripe_payment_intent_id VARCHAR,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create reviews table
    await client.query(`
      CREATE TABLE reviews (
        id SERIAL PRIMARY KEY,
        destination_id INTEGER NOT NULL REFERENCES destinations(id),
        user_id VARCHAR REFERENCES users(id),
        rating INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        comment TEXT NOT NULL,
        trip_date DATE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create activity_logs table
    await client.query(`
      CREATE TABLE activity_logs (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR REFERENCES users(id),
        action VARCHAR(255) NOT NULL,
        description TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    console.log('✅ Database tables created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Function to import users from CSV
async function importUsers() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Importing users from CSV...');
    
    const csvContent = fs.readFileSync('users.csv', 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    let successCount = 0;
    
    for (const line of lines) {
      const fields = parseCSVLine(line);
      
      if (fields.length < 11) {
        console.log('⚠️  Skipping user line with insufficient fields');
        continue;
      }
      
      const [id, username, email, password, firstName, lastName, profileImageUrl, role, lastLoginAt, isActive, createdAt, updatedAt] = fields;
      
      try {
        await client.query(`
          INSERT INTO users (id, username, email, password, first_name, last_name, profile_image_url, role, last_login_at, is_active, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `, [
          cleanValue(id),
          cleanValue(username),
          cleanValue(email),
          cleanValue(password),
          cleanValue(firstName),
          cleanValue(lastName),
          cleanValue(profileImageUrl),
          cleanValue(role) || 'user',
          cleanValue(lastLoginAt),
          cleanValue(isActive) === 'true',
          cleanValue(createdAt),
          cleanValue(updatedAt)
        ]);
        
        successCount++;
      } catch (error) {
        console.log(`❌ Error importing user ${cleanValue(username)}: ${error.message}`);
      }
    }
    
    console.log(`✅ Successfully imported ${successCount} users`);
    
  } catch (error) {
    console.error('❌ Error importing users:', error);
  } finally {
    client.release();
  }
}

// Function to import destinations from CSV
async function importDestinations() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Importing destinations from CSV...');
    
    const csvContent = fs.readFileSync('destinations.csv', 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    let successCount = 0;
    
    for (const line of lines) {
      const fields = parseCSVLine(line);
      
      if (fields.length < 15) {
        console.log('⚠️  Skipping destination line with insufficient fields');
        continue;
      }
      
      const [id, name, country, description, shortDescription, imageUrl, price, duration, distanceKm, rating, reviewCount, maxGuests, isActive, features, itinerary, createdAt, updatedAt, originalPrice, discountPercentage, promoTag, promoExpiry, discountType, seasonalTag, flashSale, flashSaleEnd, couponCode, groupDiscountMin, loyaltyDiscount, bundleDeal] = fields;
      
      try {
        await client.query(`
          INSERT INTO destinations (id, name, country, description, short_description, image_url, price, duration, distance_km, rating, review_count, max_guests, is_active, features, itinerary, created_at, updated_at, original_price, discount_percentage, promo_tag, promo_expiry, discount_type, seasonal_tag, flash_sale, flash_sale_end, coupon_code, group_discount_min, loyalty_discount, bundle_deal)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29)
        `, [
          parseInt(cleanValue(id)),
          cleanValue(name),
          cleanValue(country),
          cleanValue(description),
          cleanValue(shortDescription),
          cleanValue(imageUrl),
          parseFloat(cleanValue(price)),
          parseInt(cleanValue(duration)),
          cleanValue(distanceKm) ? parseFloat(cleanValue(distanceKm)) : null,
          cleanValue(rating) ? parseFloat(cleanValue(rating)) : 0,
          cleanValue(reviewCount) ? parseInt(cleanValue(reviewCount)) : 0,
          cleanValue(maxGuests) ? parseInt(cleanValue(maxGuests)) : 2,
          cleanValue(isActive) === 'true',
          parseJSON(features),
          parseJSON(itinerary),
          cleanValue(createdAt),
          cleanValue(updatedAt),
          cleanValue(originalPrice) ? parseFloat(cleanValue(originalPrice)) : null,
          cleanValue(discountPercentage) ? parseInt(cleanValue(discountPercentage)) : 0,
          cleanValue(promoTag),
          cleanValue(promoExpiry),
          cleanValue(discountType) || 'percentage',
          cleanValue(seasonalTag),
          cleanValue(flashSale) === 'true',
          cleanValue(flashSaleEnd),
          cleanValue(couponCode),
          cleanValue(groupDiscountMin) ? parseInt(cleanValue(groupDiscountMin)) : 0,
          cleanValue(loyaltyDiscount) ? parseInt(cleanValue(loyaltyDiscount)) : 0,
          parseJSON(bundleDeal)
        ]);
        
        successCount++;
      } catch (error) {
        console.log(`❌ Error importing destination ${cleanValue(name)}: ${error.message}`);
      }
    }
    
    console.log(`✅ Successfully imported ${successCount} destinations`);
    
  } catch (error) {
    console.error('❌ Error importing destinations:', error);
  } finally {
    client.release();
  }
}

// Function to import bookings from CSV
async function importBookings() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Importing bookings from CSV...');
    
    const csvContent = fs.readFileSync('bookings.csv', 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    let successCount = 0;
    
    for (const line of lines) {
      const fields = parseCSVLine(line);
      
      if (fields.length < 12) {
        console.log('⚠️  Skipping booking line with insufficient fields');
        continue;
      }
      
      const [id, userId, destinationId, checkIn, checkOut, guests, travelClass, upgrades, totalAmount, status, paymentStatus, stripePaymentIntentId, createdAt, updatedAt, originalAmount, appliedCouponCode, couponDiscount] = fields;
      
      try {
        await client.query(`
          INSERT INTO bookings (id, user_id, destination_id, check_in, check_out, guests, travel_class, upgrades, total_amount, status, payment_status, stripe_payment_intent_id, created_at, updated_at, original_amount, applied_coupon_code, coupon_discount)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        `, [
          parseInt(cleanValue(id)),
          cleanValue(userId),
          parseInt(cleanValue(destinationId)),
          cleanValue(checkIn),
          cleanValue(checkOut),
          parseInt(cleanValue(guests)),
          cleanValue(travelClass) || 'economy',
          parseJSON(upgrades),
          parseFloat(cleanValue(totalAmount)),
          cleanValue(status) || 'pending',
          cleanValue(paymentStatus) || 'pending',
          cleanValue(stripePaymentIntentId),
          cleanValue(createdAt),
          cleanValue(updatedAt),
          cleanValue(originalAmount) ? parseFloat(cleanValue(originalAmount)) : null,
          cleanValue(appliedCouponCode),
          cleanValue(couponDiscount) ? parseFloat(cleanValue(couponDiscount)) : 0
        ]);
        
        successCount++;
      } catch (error) {
        console.log(`❌ Error importing booking ${cleanValue(id)}: ${error.message}`);
      }
    }
    
    console.log(`✅ Successfully imported ${successCount} bookings`);
    
  } catch (error) {
    console.error('❌ Error importing bookings:', error);
  } finally {
    client.release();
  }
}

// Function to import reviews from CSV
async function importReviews() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Importing reviews from CSV...');
    
    const csvContent = fs.readFileSync('reviews.csv', 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    let successCount = 0;
    
    for (const line of lines) {
      const fields = parseCSVLine(line);
      
      if (fields.length < 8) {
        console.log('⚠️  Skipping review line with insufficient fields');
        continue;
      }
      
      const [id, destinationId, userId, rating, title, comment, tripDate, createdAt, updatedAt] = fields;
      
      try {
        await client.query(`
          INSERT INTO reviews (id, destination_id, user_id, rating, title, comment, trip_date, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          parseInt(cleanValue(id)),
          parseInt(cleanValue(destinationId)),
          cleanValue(userId),
          parseInt(cleanValue(rating)),
          cleanValue(title),
          cleanValue(comment),
          cleanValue(tripDate),
          cleanValue(createdAt),
          cleanValue(updatedAt)
        ]);
        
        successCount++;
      } catch (error) {
        console.log(`❌ Error importing review ${cleanValue(id)}: ${error.message}`);
      }
    }
    
    console.log(`✅ Successfully imported ${successCount} reviews`);
    
  } catch (error) {
    console.error('❌ Error importing reviews:', error);
  } finally {
    client.release();
  }
}

// Function to import activity logs from CSV
async function importActivityLogs() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Importing activity logs from CSV...');
    
    const csvContent = fs.readFileSync('activity_logs.csv', 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    let successCount = 0;
    
    for (const line of lines) {
      const fields = parseCSVLine(line);
      
      if (fields.length < 5) {
        console.log('⚠️  Skipping activity log line with insufficient fields');
        continue;
      }
      
      const [id, userId, action, description, metadata, createdAt] = fields;
      
      try {
        await client.query(`
          INSERT INTO activity_logs (id, user_id, action, description, metadata, created_at)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          parseInt(cleanValue(id)),
          cleanValue(userId),
          cleanValue(action),
          cleanValue(description),
          parseJSON(metadata),
          cleanValue(createdAt)
        ]);
        
        successCount++;
      } catch (error) {
        console.log(`❌ Error importing activity log ${cleanValue(id)}: ${error.message}`);
      }
    }
    
    console.log(`✅ Successfully imported ${successCount} activity logs`);
    
  } catch (error) {
    console.error('❌ Error importing activity logs:', error);
  } finally {
    client.release();
  }
}

// Function to import sessions from CSV
async function importSessions() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Importing sessions from CSV...');
    
    const csvContent = fs.readFileSync('sessions.csv', 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    let successCount = 0;
    
    for (const line of lines) {
      const fields = parseCSVLine(line);
      
      if (fields.length < 3) {
        console.log('⚠️  Skipping session line with insufficient fields');
        continue;
      }
      
      const [sid, sess, expire] = fields;
      
      try {
        await client.query(`
          INSERT INTO sessions (sid, sess, expire)
          VALUES ($1, $2, $3)
        `, [
          cleanValue(sid),
          parseJSON(sess),
          cleanValue(expire)
        ]);
        
        successCount++;
      } catch (error) {
        console.log(`❌ Error importing session ${cleanValue(sid)}: ${error.message}`);
      }
    }
    
    console.log(`✅ Successfully imported ${successCount} sessions`);
    
  } catch (error) {
    console.error('❌ Error importing sessions:', error);
  } finally {
    client.release();
  }
}

// Function to verify data integrity
async function verifyData() {
  const client = await pool.connect();
  
  try {
    console.log('\n🔍 Verifying data integrity...');
    
    // Check row counts
    const tables = ['users', 'destinations', 'bookings', 'reviews', 'activity_logs', 'sessions'];
    
    for (const table of tables) {
      const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
      console.log(`📊 ${table}: ${result.rows[0].count} rows`);
    }
    
    // Check foreign key relationships
    const orphanedBookings = await client.query(`
      SELECT COUNT(*) FROM bookings b 
      LEFT JOIN users u ON b.user_id = u.id 
      LEFT JOIN destinations d ON b.destination_id = d.id
      WHERE u.id IS NULL OR d.id IS NULL
    `);
    
    const orphanedReviews = await client.query(`
      SELECT COUNT(*) FROM reviews r 
      LEFT JOIN destinations d ON r.destination_id = d.id
      WHERE d.id IS NULL
    `);
    
    console.log(`🔗 Orphaned bookings: ${orphanedBookings.rows[0].count}`);
    console.log(`🔗 Orphaned reviews: ${orphanedReviews.rows[0].count}`);
    
    // Sample data check
    const sampleUser = await client.query('SELECT * FROM users LIMIT 1');
    const sampleDestination = await client.query('SELECT * FROM destinations LIMIT 1');
    
    console.log('\n✅ Sample data verification:');
    console.log(`📍 Sample user: ${sampleUser.rows[0]?.username || 'None'}`);
    console.log(`🏛️  Sample destination: ${sampleDestination.rows[0]?.name || 'None'}`);
    
  } catch (error) {
    console.error('❌ Error verifying data:', error);
  } finally {
    client.release();
  }
}

// Main execution function
async function main() {
  try {
    console.log('🚀 Starting data export to PostgreSQL database...\n');
    
    // Test connection
    console.log('🔄 Testing database connection...');
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Database connection successful!\n');
    
    // Create tables
    await createTables();
    
    // Import data in correct order (respecting foreign key constraints)
    await importUsers();
    await importDestinations();
    await importBookings();
    await importReviews();
    await importActivityLogs();
    await importSessions();
    
    // Verify data
    await verifyData();
    
    console.log('\n🎉 Data export completed successfully!');
    console.log('📊 All CSV data has been exported to your PostgreSQL database.');
    
  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the main function
main().catch(console.error);