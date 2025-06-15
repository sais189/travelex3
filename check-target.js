#!/usr/bin/env node

import pkg from 'pg';
const { Pool } = pkg;

const targetPool = new Pool({
  connectionString: 'postgresql://Travelex1_owner:npg_Gdv6fZW7mjzt@ep-long-glade-a20tplti-pooler.eu-central-1.aws.neon.tech/Travelex1?sslmode=require'
});

async function checkTargetDatabase() {
  try {
    console.log('Checking target database status...');
    
    // Check if tables exist
    const tablesResult = await targetPool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('Tables found:', tablesResult.rows.map(r => r.table_name));
    
    // Check record counts
    const tables = ['sessions', 'users', 'destinations', 'bookings', 'reviews', 'activity_logs'];
    
    for (const table of tables) {
      try {
        const countResult = await targetPool.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`${table}: ${countResult.rows[0].count} records`);
      } catch (error) {
        console.log(`${table}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('Error checking target database:', error.message);
  } finally {
    await targetPool.end();
  }
}

checkTargetDatabase();