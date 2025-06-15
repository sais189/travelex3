#!/usr/bin/env node

import pkg from 'pg';
const { Pool } = pkg;

const sourcePool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 2
});

const targetPool = new Pool({
  connectionString: 'postgresql://Travelex1_owner:npg_Gdv6fZW7mjzt@ep-long-glade-a20tplti-pooler.eu-central-1.aws.neon.tech/Travelex1?sslmode=require',
  max: 2
});

async function transferRemainingUsers() {
  // Get users already in target
  const targetUsers = await targetPool.query('SELECT id FROM users');
  const existingIds = new Set(targetUsers.rows.map(r => r.id));
  
  // Get all users from source
  const sourceUsers = await sourcePool.query('SELECT * FROM users ORDER BY id');
  const usersToTransfer = sourceUsers.rows.filter(u => !existingIds.has(u.id));
  
  console.log(`Transferring ${usersToTransfer.length} remaining users...`);
  
  for (const user of usersToTransfer) {
    try {
      await targetPool.query(`
        INSERT INTO users (id, username, email, password, first_name, last_name, profile_image_url, role, last_login_at, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [
        user.id, user.username, user.email, user.password, user.first_name, 
        user.last_name, user.profile_image_url, user.role, user.last_login_at, 
        user.is_active, user.created_at, user.updated_at
      ]);
    } catch (error) {
      console.error(`Error with user ${user.id}:`, error.message);
    }
  }
}

async function transferDestinations() {
  const sourceData = await sourcePool.query('SELECT * FROM destinations ORDER BY id');
  const destinations = sourceData.rows;
  
  console.log(`Transferring ${destinations.length} destinations...`);
  
  await targetPool.query('DELETE FROM destinations');
  
  for (const dest of destinations) {
    try {
      await targetPool.query(`
        INSERT INTO destinations (
          id, name, country, description, short_description, image_url, price, duration,
          distance_km, rating, review_count, max_guests, is_active, features, itinerary,
          created_at, updated_at, original_price, discount_percentage, promo_tag, promo_expiry,
          discount_type, seasonal_tag, flash_sale, flash_sale_end, coupon_code,
          group_discount_min, loyalty_discount, bundle_deal
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
          $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29
        )
      `, [
        dest.id, dest.name, dest.country, dest.description, dest.short_description,
        dest.image_url, dest.price, dest.duration, dest.distance_km, dest.rating,
        dest.review_count, dest.max_guests, dest.is_active, dest.features, dest.itinerary,
        dest.created_at, dest.updated_at, dest.original_price, dest.discount_percentage,
        dest.promo_tag, dest.promo_expiry, dest.discount_type, dest.seasonal_tag,
        dest.flash_sale, dest.flash_sale_end, dest.coupon_code, dest.group_discount_min,
        dest.loyalty_discount, dest.bundle_deal
      ]);
    } catch (error) {
      console.error(`Error with destination ${dest.id}:`, error.message);
    }
  }
  
  await targetPool.query("SELECT setval('destinations_id_seq', (SELECT MAX(id) FROM destinations))");
}

async function transferBookings() {
  const sourceData = await sourcePool.query('SELECT * FROM bookings ORDER BY id');
  const bookings = sourceData.rows;
  
  console.log(`Transferring ${bookings.length} bookings...`);
  
  await targetPool.query('DELETE FROM bookings');
  
  for (const booking of bookings) {
    try {
      await targetPool.query(`
        INSERT INTO bookings (
          id, user_id, destination_id, check_in, check_out, guests, travel_class,
          upgrades, total_amount, status, payment_status, stripe_payment_intent_id,
          created_at, updated_at, original_amount, applied_coupon_code, coupon_discount
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
        )
      `, [
        booking.id, booking.user_id, booking.destination_id, booking.check_in,
        booking.check_out, booking.guests, booking.travel_class, booking.upgrades,
        booking.total_amount, booking.status, booking.payment_status,
        booking.stripe_payment_intent_id, booking.created_at, booking.updated_at,
        booking.original_amount, booking.applied_coupon_code, booking.coupon_discount
      ]);
    } catch (error) {
      console.error(`Error with booking ${booking.id}:`, error.message);
    }
  }
  
  await targetPool.query("SELECT setval('bookings_id_seq', (SELECT MAX(id) FROM bookings))");
}

async function transferReviews() {
  const sourceData = await sourcePool.query('SELECT * FROM reviews ORDER BY id');
  const reviews = sourceData.rows;
  
  console.log(`Transferring ${reviews.length} reviews...`);
  
  await targetPool.query('DELETE FROM reviews');
  
  for (const review of reviews) {
    try {
      await targetPool.query(`
        INSERT INTO reviews (id, destination_id, user_id, rating, title, comment, trip_date, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        review.id, review.destination_id, review.user_id, review.rating,
        review.title, review.comment, review.trip_date, review.created_at, review.updated_at
      ]);
    } catch (error) {
      console.error(`Error with review ${review.id}:`, error.message);
    }
  }
  
  await targetPool.query("SELECT setval('reviews_id_seq', (SELECT MAX(id) FROM reviews))");
}

async function transferActivityLogs() {
  const sourceData = await sourcePool.query('SELECT * FROM activity_logs ORDER BY id');
  const logs = sourceData.rows;
  
  console.log(`Transferring ${logs.length} activity logs...`);
  
  await targetPool.query('DELETE FROM activity_logs');
  
  for (const log of logs) {
    try {
      await targetPool.query(`
        INSERT INTO activity_logs (id, user_id, action, description, metadata, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [log.id, log.user_id, log.action, log.description, log.metadata, log.created_at]);
    } catch (error) {
      console.error(`Error with activity log ${log.id}:`, error.message);
    }
  }
  
  await targetPool.query("SELECT setval('activity_logs_id_seq', (SELECT MAX(id) FROM activity_logs))");
}

async function transferSessions() {
  const sourceData = await sourcePool.query('SELECT * FROM sessions');
  const sessions = sourceData.rows;
  
  console.log(`Transferring ${sessions.length} sessions...`);
  
  await targetPool.query('DELETE FROM sessions');
  
  for (const session of sessions) {
    try {
      await targetPool.query(`
        INSERT INTO sessions (sid, sess, expire)
        VALUES ($1, $2, $3)
      `, [session.sid, session.sess, session.expire]);
    } catch (error) {
      console.error(`Error with session ${session.sid}:`, error.message);
    }
  }
}

async function completeMigration() {
  try {
    console.log('Completing final migration...');
    
    await transferRemainingUsers();
    await transferDestinations();
    await transferBookings();
    await transferReviews();
    await transferActivityLogs();
    await transferSessions();
    
    // Final verification
    console.log('\nFinal verification:');
    const tables = ['users', 'destinations', 'bookings', 'reviews', 'activity_logs', 'sessions'];
    
    for (const table of tables) {
      const [sourceResult, targetResult] = await Promise.all([
        sourcePool.query(`SELECT COUNT(*) FROM ${table}`),
        targetPool.query(`SELECT COUNT(*) FROM ${table}`)
      ]);
      
      const sourceCount = parseInt(sourceResult.rows[0].count);
      const targetCount = parseInt(targetResult.rows[0].count);
      console.log(`${table}: ${sourceCount} -> ${targetCount} ${sourceCount === targetCount ? '✓' : '✗'}`);
    }
    
    console.log('\nDatabase migration completed successfully!');
    
  } catch (error) {
    console.error('Migration error:', error.message);
  } finally {
    await sourcePool.end();
    await targetPool.end();
  }
}

completeMigration();