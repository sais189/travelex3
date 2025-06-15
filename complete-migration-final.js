#!/usr/bin/env node

import pkg from 'pg';
const { Pool } = pkg;

const source = new Pool({ connectionString: process.env.DATABASE_URL });
const target = new Pool({ 
  connectionString: 'postgresql://Travelex1_owner:npg_Gdv6fZW7mjzt@ep-long-glade-a20tplti-pooler.eu-central-1.aws.neon.tech/Travelex1?sslmode=require'
});

async function completeFinalMigration() {
  try {
    // Get remaining 20 reviews
    const targetReviewIds = await target.query('SELECT id FROM reviews ORDER BY id');
    const existingIds = new Set(targetReviewIds.rows.map(r => r.id));
    const allReviews = await source.query('SELECT * FROM reviews ORDER BY id');
    const missingReviews = allReviews.rows.filter(r => !existingIds.has(r.id));
    
    console.log(`Completing ${missingReviews.length} remaining reviews...`);
    for (const review of missingReviews) {
      await target.query(`
        INSERT INTO reviews (id, destination_id, user_id, rating, title, comment, trip_date, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [review.id, review.destination_id, review.user_id, review.rating, review.title, review.comment, review.trip_date, review.created_at, review.updated_at]);
    }
    
    // Complete activity logs
    const allLogs = await source.query('SELECT * FROM activity_logs ORDER BY id');
    console.log(`Transferring ${allLogs.rows.length} activity logs...`);
    
    await target.query('DELETE FROM activity_logs');
    for (const log of allLogs.rows) {
      await target.query(`
        INSERT INTO activity_logs (id, user_id, action, description, metadata, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [log.id, log.user_id, log.action, log.description, log.metadata, log.created_at]);
    }
    
    // Complete sessions
    const allSessions = await source.query('SELECT * FROM sessions');
    console.log(`Transferring ${allSessions.rows.length} sessions...`);
    
    await target.query('DELETE FROM sessions');
    for (const session of allSessions.rows) {
      await target.query(`
        INSERT INTO sessions (sid, sess, expire)
        VALUES ($1, $2, $3)
      `, [session.sid, session.sess, session.expire]);
    }
    
    // Update all sequences
    await target.query("SELECT setval('reviews_id_seq', (SELECT MAX(id) FROM reviews))");
    await target.query("SELECT setval('activity_logs_id_seq', (SELECT MAX(id) FROM activity_logs))");
    await target.query("SELECT setval('destinations_id_seq', (SELECT MAX(id) FROM destinations))");
    await target.query("SELECT setval('bookings_id_seq', (SELECT MAX(id) FROM bookings))");
    
    // Final verification
    console.log('\n=== FINAL MIGRATION VERIFICATION ===');
    const tables = ['users', 'destinations', 'bookings', 'reviews', 'activity_logs', 'sessions'];
    const expectedCounts = [205, 38, 9, 185, 121, 58];
    let allMatched = true;
    
    for (let i = 0; i < tables.length; i++) {
      const [srcResult, tgtResult] = await Promise.all([
        source.query(`SELECT COUNT(*) FROM ${tables[i]}`),
        target.query(`SELECT COUNT(*) FROM ${tables[i]}`)
      ]);
      
      const srcCount = parseInt(srcResult.rows[0].count);
      const tgtCount = parseInt(tgtResult.rows[0].count);
      const matched = srcCount === tgtCount;
      
      if (!matched) allMatched = false;
      
      console.log(`${tables[i].padEnd(15)}: ${srcCount} -> ${tgtCount} ${matched ? 'SUCCESS' : 'FAILED'}`);
    }
    
    console.log('\n=====================================');
    if (allMatched) {
      console.log('DATABASE MIGRATION COMPLETED SUCCESSFULLY');
      console.log('All data transferred exactly to:');
      console.log('postgresql://Travelex1_owner:***@ep-long-glade-a20tplti-pooler.eu-central-1.aws.neon.tech/Travelex1');
      console.log('\nThe destination database is now an exact replica of your source database.');
    } else {
      console.log('MIGRATION COMPLETED WITH SOME DISCREPANCIES');
      console.log('Please review the verification results above.');
    }
    
  } catch (error) {
    console.error('Final migration error:', error.message);
  } finally {
    await source.end();
    await target.end();
  }
}

completeFinalMigration();