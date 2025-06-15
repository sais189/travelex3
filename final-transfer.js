#!/usr/bin/env node

import pkg from 'pg';
const { Pool } = pkg;

const sourcePool = new Pool({ connectionString: process.env.DATABASE_URL });
const targetPool = new Pool({ 
  connectionString: 'postgresql://Travelex1_owner:npg_Gdv6fZW7mjzt@ep-long-glade-a20tplti-pooler.eu-central-1.aws.neon.tech/Travelex1?sslmode=require'
});

async function safeJsonStringify(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'object') return JSON.stringify(value);
  return value;
}

async function finalTransfer() {
  try {
    console.log('Completing final database transfer...');
    
    // Complete remaining users
    const existingUsers = await targetPool.query('SELECT id FROM users');
    const existingIds = new Set(existingUsers.rows.map(r => r.id));
    
    const allUsers = await sourcePool.query('SELECT * FROM users ORDER BY id');
    const remainingUsers = allUsers.rows.filter(u => !existingIds.has(u.id));
    
    console.log(`Completing ${remainingUsers.length} remaining users...`);
    for (const user of remainingUsers) {
      await targetPool.query(`
        INSERT INTO users (id, username, email, password, first_name, last_name, profile_image_url, role, last_login_at, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO NOTHING
      `, [user.id, user.username, user.email, user.password, user.first_name, user.last_name, user.profile_image_url, user.role, user.last_login_at, user.is_active, user.created_at, user.updated_at]);
    }
    
    // Transfer destinations with proper JSON handling
    console.log('Transferring destinations...');
    const destinations = await sourcePool.query('SELECT * FROM destinations ORDER BY id');
    await targetPool.query('TRUNCATE destinations RESTART IDENTITY CASCADE');
    
    for (const dest of destinations.rows) {
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
        dest.review_count, dest.max_guests, dest.is_active, 
        await safeJsonStringify(dest.features), 
        await safeJsonStringify(dest.itinerary),
        dest.created_at, dest.updated_at, dest.original_price, dest.discount_percentage,
        dest.promo_tag, dest.promo_expiry, dest.discount_type, dest.seasonal_tag,
        dest.flash_sale, dest.flash_sale_end, dest.coupon_code, dest.group_discount_min,
        dest.loyalty_discount, await safeJsonStringify(dest.bundle_deal)
      ]);
    }
    await targetPool.query("SELECT setval('destinations_id_seq', (SELECT MAX(id) FROM destinations))");
    
    // Transfer bookings
    console.log('Transferring bookings...');
    const bookings = await sourcePool.query('SELECT * FROM bookings ORDER BY id');
    await targetPool.query('TRUNCATE bookings RESTART IDENTITY CASCADE');
    
    for (const booking of bookings.rows) {
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
        booking.check_out, booking.guests, booking.travel_class, 
        await safeJsonStringify(booking.upgrades),
        booking.total_amount, booking.status, booking.payment_status,
        booking.stripe_payment_intent_id, booking.created_at, booking.updated_at,
        booking.original_amount, booking.applied_coupon_code, booking.coupon_discount
      ]);
    }
    await targetPool.query("SELECT setval('bookings_id_seq', (SELECT MAX(id) FROM bookings))");
    
    // Transfer reviews
    console.log('Transferring reviews...');
    const reviews = await sourcePool.query('SELECT * FROM reviews ORDER BY id');
    await targetPool.query('TRUNCATE reviews RESTART IDENTITY CASCADE');
    
    for (const review of reviews.rows) {
      await targetPool.query(`
        INSERT INTO reviews (id, destination_id, user_id, rating, title, comment, trip_date, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        review.id, review.destination_id, review.user_id, review.rating,
        review.title, review.comment, review.trip_date, review.created_at, review.updated_at
      ]);
    }
    await targetPool.query("SELECT setval('reviews_id_seq', (SELECT MAX(id) FROM reviews))");
    
    // Transfer activity logs
    console.log('Transferring activity logs...');
    const logs = await sourcePool.query('SELECT * FROM activity_logs ORDER BY id');
    await targetPool.query('TRUNCATE activity_logs RESTART IDENTITY CASCADE');
    
    for (const log of logs.rows) {
      await targetPool.query(`
        INSERT INTO activity_logs (id, user_id, action, description, metadata, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        log.id, log.user_id, log.action, log.description, 
        await safeJsonStringify(log.metadata), log.created_at
      ]);
    }
    await targetPool.query("SELECT setval('activity_logs_id_seq', (SELECT MAX(id) FROM activity_logs))");
    
    // Transfer sessions
    console.log('Transferring sessions...');
    const sessions = await sourcePool.query('SELECT * FROM sessions');
    await targetPool.query('TRUNCATE sessions CASCADE');
    
    for (const session of sessions.rows) {
      await targetPool.query(`
        INSERT INTO sessions (sid, sess, expire)
        VALUES ($1, $2, $3)
      `, [session.sid, session.sess, session.expire]);
    }
    
    // Final verification
    console.log('\n=== MIGRATION VERIFICATION ===');
    const tables = ['users', 'destinations', 'bookings', 'reviews', 'activity_logs', 'sessions'];
    let allSuccess = true;
    
    for (const table of tables) {
      const [src, tgt] = await Promise.all([
        sourcePool.query(`SELECT COUNT(*) FROM ${table}`),
        targetPool.query(`SELECT COUNT(*) FROM ${table}`)
      ]);
      
      const srcCount = parseInt(src.rows[0].count);
      const tgtCount = parseInt(tgt.rows[0].count);
      const success = srcCount === tgtCount;
      
      if (!success) allSuccess = false;
      
      console.log(`${table.padEnd(15)}: ${srcCount.toString().padStart(3)} -> ${tgtCount.toString().padStart(3)} ${success ? 'SUCCESS' : 'FAILED'}`);
    }
    
    console.log('\n' + '='.repeat(50));
    if (allSuccess) {
      console.log('DATABASE MIGRATION COMPLETED SUCCESSFULLY');
      console.log('All data has been transferred exactly to the new database');
    } else {
      console.log('MIGRATION COMPLETED WITH SOME ISSUES');
      console.log('Please review the verification results above');
    }
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('Migration error:', error.message);
  } finally {
    await sourcePool.end();
    await targetPool.end();
  }
}

finalTransfer();