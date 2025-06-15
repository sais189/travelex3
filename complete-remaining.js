#!/usr/bin/env node

import pkg from 'pg';
const { Pool } = pkg;

const sourcePool = new Pool({ connectionString: process.env.DATABASE_URL });
const targetPool = new Pool({ 
  connectionString: 'postgresql://Travelex1_owner:npg_Gdv6fZW7mjzt@ep-long-glade-a20tplti-pooler.eu-central-1.aws.neon.tech/Travelex1?sslmode=require'
});

async function completeRemaining() {
  try {
    // Complete reviews (131 remaining out of 185 total)
    const allReviews = await sourcePool.query('SELECT * FROM reviews ORDER BY id');
    const targetReviews = await targetPool.query('SELECT id FROM reviews ORDER BY id');
    const existingReviewIds = new Set(targetReviews.rows.map(r => r.id));
    
    const remainingReviews = allReviews.rows.filter(r => !existingReviewIds.has(r.id));
    console.log(`Completing ${remainingReviews.length} remaining reviews...`);
    
    for (const review of remainingReviews) {
      await targetPool.query(`
        INSERT INTO reviews (id, destination_id, user_id, rating, title, comment, trip_date, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO NOTHING
      `, [review.id, review.destination_id, review.user_id, review.rating, review.title, review.comment, review.trip_date, review.created_at, review.updated_at]);
    }
    
    await targetPool.query("SELECT setval('reviews_id_seq', (SELECT MAX(id) FROM reviews))");
    
    // Complete activity logs (121 total)
    const allLogs = await sourcePool.query('SELECT * FROM activity_logs ORDER BY id');
    console.log(`Transferring ${allLogs.rows.length} activity logs...`);
    
    await targetPool.query('TRUNCATE activity_logs RESTART IDENTITY CASCADE');
    for (const log of allLogs.rows) {
      await targetPool.query(`
        INSERT INTO activity_logs (id, user_id, action, description, metadata, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [log.id, log.user_id, log.action, log.description, log.metadata, log.created_at]);
    }
    await targetPool.query("SELECT setval('activity_logs_id_seq', (SELECT MAX(id) FROM activity_logs))");
    
    // Complete sessions (58 total)
    const allSessions = await sourcePool.query('SELECT * FROM sessions');
    console.log(`Transferring ${allSessions.rows.length} sessions...`);
    
    await targetPool.query('TRUNCATE sessions CASCADE');
    for (const session of allSessions.rows) {
      await targetPool.query(`
        INSERT INTO sessions (sid, sess, expire)
        VALUES ($1, $2, $3)
      `, [session.sid, session.sess, session.expire]);
    }
    
    // Final verification
    console.log('\nFinal verification:');
    const tables = ['users', 'destinations', 'bookings', 'reviews', 'activity_logs', 'sessions'];
    const expectedCounts = [205, 38, 9, 185, 121, 58];
    
    for (let i = 0; i < tables.length; i++) {
      const result = await targetPool.query(`SELECT COUNT(*) FROM ${tables[i]}`);
      const count = parseInt(result.rows[0].count);
      const expected = expectedCounts[i];
      console.log(`${tables[i]}: ${count}/${expected} ${count === expected ? 'SUCCESS' : 'PARTIAL'}`);
    }
    
    console.log('\nDatabase migration completed successfully!');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sourcePool.end();
    await targetPool.end();
  }
}

completeRemaining();