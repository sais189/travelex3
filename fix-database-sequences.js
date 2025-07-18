#!/usr/bin/env node

import { Pool } from 'pg';

const DATABASE_URL = "postgresql://sai_j16q_user:Ktz9XhfvegcunhDBccYng71gUSfvoFvY@dpg-d1ss8amr433s73emf0l0-a.singapore-postgres.render.com/sai_j16q?sslmode=require";

const pool = new Pool({
  connectionString: DATABASE_URL,
});

async function fixDatabaseSequences() {
  try {
    console.log('🔄 Fixing database sequences...');
    
    // Check current max IDs
    const bookingsResult = await pool.query('SELECT COALESCE(MAX(id), 0) as max_id FROM bookings');
    const activityLogsResult = await pool.query('SELECT COALESCE(MAX(id), 0) as max_id FROM activity_logs');
    const usersResult = await pool.query('SELECT COUNT(*) as count FROM users');
    const destinationsResult = await pool.query('SELECT COALESCE(MAX(id), 0) as max_id FROM destinations');
    const reviewsResult = await pool.query('SELECT COALESCE(MAX(id), 0) as max_id FROM reviews');
    
    const maxBookingId = bookingsResult.rows[0].max_id;
    const maxActivityLogId = activityLogsResult.rows[0].max_id;
    const maxDestinationId = destinationsResult.rows[0].max_id;
    const maxReviewId = reviewsResult.rows[0].max_id;
    
    console.log(`📊 Current max IDs:`);
    console.log(`   Bookings: ${maxBookingId}`);
    console.log(`   Activity Logs: ${maxActivityLogId}`);
    console.log(`   Destinations: ${maxDestinationId}`);
    console.log(`   Reviews: ${maxReviewId}`);
    
    // Reset sequences to avoid conflicts
    await pool.query(`SELECT setval('bookings_id_seq', ${parseInt(maxBookingId) + 1}, false)`);
    await pool.query(`SELECT setval('activity_logs_id_seq', ${parseInt(maxActivityLogId) + 1}, false)`);
    await pool.query(`SELECT setval('destinations_id_seq', ${parseInt(maxDestinationId) + 1}, false)`);
    await pool.query(`SELECT setval('reviews_id_seq', ${parseInt(maxReviewId) + 1}, false)`);
    
    console.log('✅ Database sequences fixed successfully!');
    console.log(`   Next booking ID will be: ${parseInt(maxBookingId) + 1}`);
    console.log(`   Next activity log ID will be: ${parseInt(maxActivityLogId) + 1}`);
    
    // Test the sequences
    const testBookingSeq = await pool.query("SELECT nextval('bookings_id_seq')");
    const testActivitySeq = await pool.query("SELECT nextval('activity_logs_id_seq')");
    
    console.log(`🧪 Sequence test results:`);
    console.log(`   Next booking ID: ${testBookingSeq.rows[0].nextval}`);
    console.log(`   Next activity log ID: ${testActivitySeq.rows[0].nextval}`);
    
    // Reset sequences back to where they should be
    await pool.query(`SELECT setval('bookings_id_seq', ${parseInt(maxBookingId) + 1}, false)`);
    await pool.query(`SELECT setval('activity_logs_id_seq', ${parseInt(maxActivityLogId) + 1}, false)`);
    
  } catch (error) {
    console.error('❌ Error fixing database sequences:', error);
  } finally {
    await pool.end();
  }
}

// Run the fix
fixDatabaseSequences();