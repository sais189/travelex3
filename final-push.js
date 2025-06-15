#!/usr/bin/env node

import pkg from 'pg';
const { Pool } = pkg;

const source = new Pool({ connectionString: process.env.DATABASE_URL });
const target = new Pool({ 
  connectionString: 'postgresql://Travelex1_owner:npg_Gdv6fZW7mjzt@ep-long-glade-a20tplti-pooler.eu-central-1.aws.neon.tech/Travelex1?sslmode=require'
});

async function finalPush() {
  try {
    // Complete reviews transfer - get missing ones
    const [allReviews, targetReviews] = await Promise.all([
      source.query('SELECT * FROM reviews ORDER BY id'),
      target.query('SELECT id FROM reviews')
    ]);
    
    const existingIds = new Set(targetReviews.rows.map(r => r.id));
    const missing = allReviews.rows.filter(r => !existingIds.has(r.id));
    
    console.log(`Adding ${missing.length} missing reviews...`);
    for (const review of missing) {
      await target.query(`
        INSERT INTO reviews (id, destination_id, user_id, rating, title, comment, trip_date, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO NOTHING
      `, [review.id, review.destination_id, review.user_id, review.rating, review.title, review.comment, review.trip_date, review.created_at, review.updated_at]);
    }
    
    // Transfer activity logs completely
    const logs = await source.query('SELECT * FROM activity_logs ORDER BY id');
    console.log(`Transferring ${logs.rows.length} activity logs...`);
    
    await target.query('DELETE FROM activity_logs');
    for (const log of logs.rows) {
      await target.query(`
        INSERT INTO activity_logs (id, user_id, action, description, metadata, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [log.id, log.user_id, log.action, log.description, log.metadata, log.created_at]);
    }
    
    // Transfer sessions completely
    const sessions = await source.query('SELECT * FROM sessions');
    console.log(`Transferring ${sessions.rows.length} sessions...`);
    
    await target.query('DELETE FROM sessions');
    for (const session of sessions.rows) {
      await target.query(`
        INSERT INTO sessions (sid, sess, expire)
        VALUES ($1, $2, $3)
      `, [session.sid, session.sess, session.expire]);
    }
    
    // Update sequences
    await target.query("SELECT setval('reviews_id_seq', (SELECT COALESCE(MAX(id), 1) FROM reviews))");
    await target.query("SELECT setval('activity_logs_id_seq', (SELECT COALESCE(MAX(id), 1) FROM activity_logs))");
    
    // Final count verification
    console.log('\nFinal verification:');
    const tables = ['users', 'destinations', 'bookings', 'reviews', 'activity_logs', 'sessions'];
    
    for (const table of tables) {
      const [src, tgt] = await Promise.all([
        source.query(`SELECT COUNT(*) FROM ${table}`),
        target.query(`SELECT COUNT(*) FROM ${table}`)
      ]);
      console.log(`${table}: ${src.rows[0].count} -> ${tgt.rows[0].count}`);
    }
    
    console.log('\nMigration complete!');
    
  } finally {
    await source.end();
    await target.end();
  }
}

finalPush();