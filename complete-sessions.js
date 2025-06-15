#!/usr/bin/env node

import pkg from 'pg';
const { Pool } = pkg;

const source = new Pool({ connectionString: process.env.DATABASE_URL });
const target = new Pool({ 
  connectionString: 'postgresql://Travelex1_owner:npg_Gdv6fZW7mjzt@ep-long-glade-a20tplti-pooler.eu-central-1.aws.neon.tech/Travelex1?sslmode=require'
});

async function completeSessions() {
  try {
    console.log('Completing sessions transfer...');
    
    // Get all sessions from source
    const allSessions = await source.query('SELECT * FROM sessions');
    console.log(`Found ${allSessions.rows.length} sessions in source database`);
    
    // Clear and reload all sessions
    await target.query('TRUNCATE sessions CASCADE');
    
    let transferred = 0;
    for (const session of allSessions.rows) {
      try {
        await target.query(`
          INSERT INTO sessions (sid, sess, expire)
          VALUES ($1, $2, $3)
        `, [session.sid, session.sess, session.expire]);
        transferred++;
      } catch (error) {
        console.error(`Error transferring session ${session.sid}:`, error.message);
      }
    }
    
    console.log(`Successfully transferred ${transferred}/${allSessions.rows.length} sessions`);
    
    // Final verification
    const [srcCount, tgtCount] = await Promise.all([
      source.query('SELECT COUNT(*) FROM sessions'),
      target.query('SELECT COUNT(*) FROM sessions')
    ]);
    
    const sourceSessionCount = parseInt(srcCount.rows[0].count);
    const targetSessionCount = parseInt(tgtCount.rows[0].count);
    
    console.log(`\nFinal sessions count: ${sourceSessionCount} -> ${targetSessionCount}`);
    
    if (sourceSessionCount === targetSessionCount) {
      console.log('Sessions transfer completed successfully');
      
      // Complete migration verification
      console.log('\nFinal migration verification:');
      const tables = ['users', 'destinations', 'bookings', 'reviews', 'activity_logs', 'sessions'];
      let allComplete = true;
      
      for (const table of tables) {
        const [src, tgt] = await Promise.all([
          source.query(`SELECT COUNT(*) FROM ${table}`),
          target.query(`SELECT COUNT(*) FROM ${table}`)
        ]);
        
        const srcCount = parseInt(src.rows[0].count);
        const tgtCount = parseInt(tgt.rows[0].count);
        const success = srcCount === tgtCount;
        
        if (!success) allComplete = false;
        
        console.log(`${table}: ${srcCount} -> ${tgtCount} ${success ? 'SUCCESS' : 'FAILED'}`);
      }
      
      if (allComplete) {
        console.log('\nDATABASE MIGRATION COMPLETED SUCCESSFULLY');
        console.log('All data has been transferred exactly to the new database');
      }
    } else {
      console.log('Sessions transfer incomplete');
    }
    
  } catch (error) {
    console.error('Error completing sessions:', error.message);
  } finally {
    await source.end();
    await target.end();
  }
}

completeSessions();