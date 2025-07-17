import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

// Connection to your Render database
const pool = new Pool({
  connectionString: "postgresql://travelex_postgresqldatabase_89r4_user:xtn0p5OdhfhWDTPxBNEsvnBTOEeuLpaQ@dpg-d1e921p5pdvs73bqamvg-a.singapore-postgres.render.com/travelex_postgresqldatabase_89r4",
  ssl: {
    rejectUnauthorized: false
  }
});

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = null;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (!inQuotes && (char === '"' || char === "'")) {
      inQuotes = true;
      quoteChar = char;
    } else if (inQuotes && char === quoteChar) {
      // Check if this is an escaped quote
      if (i + 1 < line.length && line[i + 1] === quoteChar) {
        current += char;
        i++; // Skip the next quote
      } else {
        inQuotes = false;
        quoteChar = null;
      }
    } else if (!inQuotes && char === '\t') {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

function cleanValue(value) {
  if (!value || value === '\\N' || value === 'null') return null;
  
  // Remove surrounding quotes if present
  if ((value.startsWith('"') && value.endsWith('"')) || 
      (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  
  // Handle escaped quotes
  value = value.replace(/""/g, '"').replace(/''/g, "'");
  
  return value;
}

async function migrateUsers() {
  console.log('🔄 Migrating users...');
  
  const csvContent = fs.readFileSync('users.csv', 'utf8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  const client = await pool.connect();
  
  try {
    for (const line of lines) {
      const fields = parseCSVLine(line);
      
      const [id, username, email, password, firstName, lastName, profileImageUrl, role, lastLoginAt, isActive, createdAt, updatedAt] = fields;
      
      const query = `
        INSERT INTO users (id, username, email, password, first_name, last_name, profile_image_url, role, last_login_at, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO UPDATE SET
          username = EXCLUDED.username,
          email = EXCLUDED.email,
          password = EXCLUDED.password,
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          profile_image_url = EXCLUDED.profile_image_url,
          role = EXCLUDED.role,
          last_login_at = EXCLUDED.last_login_at,
          is_active = EXCLUDED.is_active,
          updated_at = EXCLUDED.updated_at
      `;
      
      await client.query(query, [
        cleanValue(id),
        cleanValue(username),
        cleanValue(email),
        cleanValue(password),
        cleanValue(firstName),
        cleanValue(lastName),
        cleanValue(profileImageUrl),
        cleanValue(role) || 'user',
        cleanValue(lastLoginAt),
        cleanValue(isActive) === 'true' ? true : false,
        cleanValue(createdAt),
        cleanValue(updatedAt)
      ]);
    }
    
    console.log(`✅ Successfully migrated ${lines.length} users`);
  } catch (error) {
    console.error('❌ Error migrating users:', error);
  } finally {
    client.release();
  }
}

async function migrateDestinations() {
  console.log('🔄 Migrating destinations...');
  
  const csvContent = fs.readFileSync('destinations.csv', 'utf8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  const client = await pool.connect();
  
  try {
    for (const line of lines) {
      const fields = parseCSVLine(line);
      
      const [id, name, country, description, shortDescription, imageUrl, price, duration, distanceKm, rating, reviewCount, maxGuests, isActive, features, itinerary, createdAt, updatedAt, originalPrice, discountPercentage, promoTag, promoExpiry, discountType, seasonalTag, flashSale, flashSaleEnd, couponCode, groupDiscountMin, loyaltyDiscount, bundleDeal] = fields;
      
      let featuresJson = null;
      let itineraryJson = null;
      let bundleDealJson = null;
      
      try {
        if (features && features !== '\\N') {
          featuresJson = JSON.parse(features.replace(/'/g, '"'));
        }
      } catch (e) {
        console.log('Warning: Could not parse features for destination:', name);
      }
      
      try {
        if (itinerary && itinerary !== '\\N') {
          itineraryJson = JSON.parse(itinerary.replace(/'/g, '"'));
        }
      } catch (e) {
        console.log('Warning: Could not parse itinerary for destination:', name);
      }
      
      try {
        if (bundleDeal && bundleDeal !== '\\N') {
          bundleDealJson = JSON.parse(bundleDeal.replace(/'/g, '"'));
        }
      } catch (e) {
        console.log('Warning: Could not parse bundle deal for destination:', name);
      }
      
      const query = `
        INSERT INTO destinations (id, name, country, description, short_description, image_url, price, duration, distance_km, rating, review_count, max_guests, is_active, features, itinerary, created_at, updated_at, original_price, discount_percentage, promo_tag, promo_expiry, discount_type, seasonal_tag, flash_sale, flash_sale_end, coupon_code, group_discount_min, loyalty_discount, bundle_deal)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          country = EXCLUDED.country,
          description = EXCLUDED.description,
          short_description = EXCLUDED.short_description,
          image_url = EXCLUDED.image_url,
          price = EXCLUDED.price,
          duration = EXCLUDED.duration,
          distance_km = EXCLUDED.distance_km,
          rating = EXCLUDED.rating,
          review_count = EXCLUDED.review_count,
          max_guests = EXCLUDED.max_guests,
          is_active = EXCLUDED.is_active,
          features = EXCLUDED.features,
          itinerary = EXCLUDED.itinerary,
          updated_at = EXCLUDED.updated_at,
          original_price = EXCLUDED.original_price,
          discount_percentage = EXCLUDED.discount_percentage,
          promo_tag = EXCLUDED.promo_tag,
          promo_expiry = EXCLUDED.promo_expiry,
          discount_type = EXCLUDED.discount_type,
          seasonal_tag = EXCLUDED.seasonal_tag,
          flash_sale = EXCLUDED.flash_sale,
          flash_sale_end = EXCLUDED.flash_sale_end,
          coupon_code = EXCLUDED.coupon_code,
          group_discount_min = EXCLUDED.group_discount_min,
          loyalty_discount = EXCLUDED.loyalty_discount,
          bundle_deal = EXCLUDED.bundle_deal
      `;
      
      await client.query(query, [
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
        parseInt(cleanValue(reviewCount)) || 0,
        parseInt(cleanValue(maxGuests)) || 2,
        cleanValue(isActive) === 'true' ? true : false,
        featuresJson,
        itineraryJson,
        cleanValue(createdAt),
        cleanValue(updatedAt),
        cleanValue(originalPrice) ? parseFloat(cleanValue(originalPrice)) : null,
        parseInt(cleanValue(discountPercentage)) || 0,
        cleanValue(promoTag),
        cleanValue(promoExpiry),
        cleanValue(discountType) || 'percentage',
        cleanValue(seasonalTag),
        cleanValue(flashSale) === 'true' ? true : false,
        cleanValue(flashSaleEnd),
        cleanValue(couponCode),
        parseInt(cleanValue(groupDiscountMin)) || 0,
        parseInt(cleanValue(loyaltyDiscount)) || 0,
        bundleDealJson
      ]);
    }
    
    console.log(`✅ Successfully migrated ${lines.length} destinations`);
  } catch (error) {
    console.error('❌ Error migrating destinations:', error);
  } finally {
    client.release();
  }
}

async function migrateBookings() {
  console.log('🔄 Migrating bookings...');
  
  const csvContent = fs.readFileSync('bookings.csv', 'utf8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  const client = await pool.connect();
  
  try {
    for (const line of lines) {
      const fields = parseCSVLine(line);
      
      const [id, userId, destinationId, checkIn, checkOut, guests, travelClass, upgrades, totalAmount, status, paymentStatus, stripePaymentIntentId, createdAt, updatedAt, originalAmount, appliedCouponCode, couponDiscount] = fields;
      
      let upgradesJson = null;
      try {
        if (upgrades && upgrades !== '\\N' && upgrades !== '[]') {
          upgradesJson = JSON.parse(upgrades.replace(/'/g, '"'));
        }
      } catch (e) {
        console.log('Warning: Could not parse upgrades for booking:', id);
      }
      
      const query = `
        INSERT INTO bookings (id, user_id, destination_id, check_in, check_out, guests, travel_class, upgrades, total_amount, status, payment_status, stripe_payment_intent_id, created_at, updated_at, original_amount, applied_coupon_code, coupon_discount)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        ON CONFLICT (id) DO UPDATE SET
          user_id = EXCLUDED.user_id,
          destination_id = EXCLUDED.destination_id,
          check_in = EXCLUDED.check_in,
          check_out = EXCLUDED.check_out,
          guests = EXCLUDED.guests,
          travel_class = EXCLUDED.travel_class,
          upgrades = EXCLUDED.upgrades,
          total_amount = EXCLUDED.total_amount,
          status = EXCLUDED.status,
          payment_status = EXCLUDED.payment_status,
          stripe_payment_intent_id = EXCLUDED.stripe_payment_intent_id,
          updated_at = EXCLUDED.updated_at,
          original_amount = EXCLUDED.original_amount,
          applied_coupon_code = EXCLUDED.applied_coupon_code,
          coupon_discount = EXCLUDED.coupon_discount
      `;
      
      await client.query(query, [
        parseInt(cleanValue(id)),
        cleanValue(userId),
        parseInt(cleanValue(destinationId)),
        cleanValue(checkIn),
        cleanValue(checkOut),
        parseInt(cleanValue(guests)),
        cleanValue(travelClass) || 'economy',
        upgradesJson,
        parseFloat(cleanValue(totalAmount)),
        cleanValue(status) || 'pending',
        cleanValue(paymentStatus) || 'pending',
        cleanValue(stripePaymentIntentId),
        cleanValue(createdAt),
        cleanValue(updatedAt),
        cleanValue(originalAmount) ? parseFloat(cleanValue(originalAmount)) : null,
        cleanValue(appliedCouponCode),
        parseFloat(cleanValue(couponDiscount)) || 0
      ]);
    }
    
    console.log(`✅ Successfully migrated ${lines.length} bookings`);
  } catch (error) {
    console.error('❌ Error migrating bookings:', error);
  } finally {
    client.release();
  }
}

async function migrateReviews() {
  console.log('🔄 Migrating reviews...');
  
  const csvContent = fs.readFileSync('reviews.csv', 'utf8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  const client = await pool.connect();
  
  try {
    for (const line of lines) {
      const fields = parseCSVLine(line);
      
      const [id, destinationId, userId, rating, title, comment, tripDate, createdAt, updatedAt] = fields;
      
      const query = `
        INSERT INTO reviews (id, destination_id, user_id, rating, title, comment, trip_date, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO UPDATE SET
          destination_id = EXCLUDED.destination_id,
          user_id = EXCLUDED.user_id,
          rating = EXCLUDED.rating,
          title = EXCLUDED.title,
          comment = EXCLUDED.comment,
          trip_date = EXCLUDED.trip_date,
          updated_at = EXCLUDED.updated_at
      `;
      
      await client.query(query, [
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
    }
    
    console.log(`✅ Successfully migrated ${lines.length} reviews`);
  } catch (error) {
    console.error('❌ Error migrating reviews:', error);
  } finally {
    client.release();
  }
}

async function migrateActivityLogs() {
  console.log('🔄 Migrating activity logs...');
  
  const csvContent = fs.readFileSync('activity_logs.csv', 'utf8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  const client = await pool.connect();
  
  try {
    for (const line of lines) {
      const fields = parseCSVLine(line);
      
      const [id, userId, action, description, metadata, createdAt] = fields;
      
      let metadataJson = null;
      try {
        if (metadata && metadata !== '\\N') {
          metadataJson = JSON.parse(metadata.replace(/'/g, '"'));
        }
      } catch (e) {
        console.log('Warning: Could not parse metadata for activity log:', id);
      }
      
      const query = `
        INSERT INTO activity_logs (id, user_id, action, description, metadata, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
          user_id = EXCLUDED.user_id,
          action = EXCLUDED.action,
          description = EXCLUDED.description,
          metadata = EXCLUDED.metadata,
          created_at = EXCLUDED.created_at
      `;
      
      await client.query(query, [
        parseInt(cleanValue(id)),
        cleanValue(userId),
        cleanValue(action),
        cleanValue(description),
        metadataJson,
        cleanValue(createdAt)
      ]);
    }
    
    console.log(`✅ Successfully migrated ${lines.length} activity logs`);
  } catch (error) {
    console.error('❌ Error migrating activity logs:', error);
  } finally {
    client.release();
  }
}

async function migrateSessions() {
  console.log('🔄 Migrating sessions...');
  
  const csvContent = fs.readFileSync('sessions.csv', 'utf8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  const client = await pool.connect();
  
  try {
    for (const line of lines) {
      const fields = parseCSVLine(line);
      
      const [sid, sess, expire] = fields;
      
      let sessJson = null;
      try {
        if (sess && sess !== '\\N') {
          sessJson = JSON.parse(sess.replace(/'/g, '"'));
        }
      } catch (e) {
        console.log('Warning: Could not parse session data for session:', sid);
        continue;
      }
      
      const query = `
        INSERT INTO sessions (sid, sess, expire)
        VALUES ($1, $2, $3)
        ON CONFLICT (sid) DO UPDATE SET
          sess = EXCLUDED.sess,
          expire = EXCLUDED.expire
      `;
      
      await client.query(query, [
        cleanValue(sid),
        sessJson,
        cleanValue(expire)
      ]);
    }
    
    console.log(`✅ Successfully migrated ${lines.length} sessions`);
  } catch (error) {
    console.error('❌ Error migrating sessions:', error);
  } finally {
    client.release();
  }
}

async function main() {
  console.log('🚀 Starting CSV to Render database migration...');
  
  try {
    // Test database connection
    console.log('🔄 Testing database connection...');
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Database connection successful');
    
    // Run migrations in order (users first, then destinations, then bookings/reviews)
    await migrateUsers();
    await migrateDestinations();
    await migrateBookings();
    await migrateReviews();
    await migrateActivityLogs();
    await migrateSessions();
    
    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await pool.end();
  }
}

main();