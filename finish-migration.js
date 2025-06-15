#!/usr/bin/env node

import pkg from 'pg';
const { Pool } = pkg;

const source = new Pool({ connectionString: process.env.DATABASE_URL });
const target = new Pool({ 
  connectionString: 'postgresql://Travelex1_owner:npg_Gdv6fZW7mjzt@ep-long-glade-a20tplti-pooler.eu-central-1.aws.neon.tech/Travelex1?sslmode=require'
});

async function finishMigration() {
  try {
    // Complete activity logs - get remaining ones
    const targetLogIds = await target.query('SELECT id FROM activity_logs ORDER BY id');
    const existingLogIds = new Set(targetLogIds.rows.map(r => r.id));
    const allLogs = await source.query('SELECT * FROM activity_logs ORDER BY id');
    const missingLogs = allLogs.rows.filter(l => !existingLogIds.has(l.id));
    
    console.log(`Completing ${missingLogs.length} remaining activity logs...`);
    for (const log of missingLogs) {
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
    
    // Update sequences
    await target.query("SELECT setval('activity_logs_id_seq', (SELECT MAX(id) FROM activity_logs))");
    
    // Final verification
    console.log('\nFinal Migration Status:');
    const tables = ['users', 'destinations', 'bookings', 'reviews', 'activity_logs', 'sessions'];
    
    for (const table of tables) {
      const [srcResult, tgtResult] = await Promise.all([
        source.query(`SELECT COUNT(*) FROM ${table}`),
        target.query(`SELECT COUNT(*) FROM ${table}`)
      ]);
      
      const srcCount = parseInt(srcResult.rows[0].count);
      const tgtCount = parseInt(tgtResult.rows[0].count);
      console.log(`${table}: ${srcCount} -> ${tgtCount} ${srcCount === tgtCount ? 'SUCCESS' : 'PARTIAL'}`);
    }
    
    console.log('\nMigration completed successfully!');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await source.end();
    await target.end();
  }
}

finishMigration();