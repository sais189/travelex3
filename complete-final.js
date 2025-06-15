#!/usr/bin/env node

import pkg from 'pg';
const { Pool } = pkg;

const source = new Pool({ connectionString: process.env.DATABASE_URL });
const target = new Pool({ 
  connectionString: 'postgresql://Travelex1_owner:npg_Gdv6fZW7mjzt@ep-long-glade-a20tplti-pooler.eu-central-1.aws.neon.tech/Travelex1?sslmode=require'
});

async function completeFinal() {
  try {
    // Get remaining activity logs
    const targetLogs = await target.query('SELECT id FROM activity_logs ORDER BY id');
    const existingIds = new Set(targetLogs.rows.map(r => r.id));
    const allLogs = await source.query('SELECT * FROM activity_logs ORDER BY id');
    const missing = allLogs.rows.filter(l => !existingIds.has(l.id));
    
    console.log(`Adding ${missing.length} remaining activity logs...`);
    for (const log of missing) {
      await target.query(`
        INSERT INTO activity_logs (id, user_id, action, description, metadata, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [log.id, log.user_id, log.action, log.description, log.metadata, log.created_at]);
    }
    
    // Complete sessions
    const sessions = await source.query('SELECT * FROM sessions');
    console.log(`Adding ${sessions.rows.length} sessions...`);
    
    await target.query('DELETE FROM sessions');
    for (const session of sessions.rows) {
      await target.query(`
        INSERT INTO sessions (sid, sess, expire)
        VALUES ($1, $2, $3)
      `, [session.sid, session.sess, session.expire]);
    }
    
    // Update sequences
    await target.query("SELECT setval('activity_logs_id_seq', (SELECT MAX(id) FROM activity_logs))");
    
    // Final counts
    const results = {};
    const tables = ['users', 'destinations', 'bookings', 'reviews', 'activity_logs', 'sessions'];
    
    for (const table of tables) {
      const [src, tgt] = await Promise.all([
        source.query(`SELECT COUNT(*) FROM ${table}`),
        target.query(`SELECT COUNT(*) FROM ${table}`)
      ]);
      results[table] = {
        source: parseInt(src.rows[0].count),
        target: parseInt(tgt.rows[0].count)
      };
    }
    
    console.log('\nMigration Results:');
    for (const [table, counts] of Object.entries(results)) {
      console.log(`${table}: ${counts.source} -> ${counts.target} ${counts.source === counts.target ? 'SUCCESS' : 'FAILED'}`);
    }
    
    const totalSource = Object.values(results).reduce((sum, r) => sum + r.source, 0);
    const totalTarget = Object.values(results).reduce((sum, r) => sum + r.target, 0);
    
    console.log(`Total: ${totalSource} -> ${totalTarget}`);
    console.log(totalSource === totalTarget ? 'MIGRATION SUCCESSFUL' : 'MIGRATION INCOMPLETE');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await source.end();
    await target.end();
  }
}

completeFinal();