#!/usr/bin/env node

import pkg from 'pg';
const { Pool } = pkg;

const sourcePool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
const targetPool = new Pool({ 
  connectionString: 'postgresql://Travelex1_owner:npg_Gdv6fZW7mjzt@ep-long-glade-a20tplti-pooler.eu-central-1.aws.neon.tech/Travelex1?sslmode=require', 
  max: 1 
});

async function quickComplete() {
  try {
    // Get remaining user count
    const [sourceUsers, targetUsers] = await Promise.all([
      sourcePool.query('SELECT COUNT(*) FROM users'),
      targetPool.query('SELECT COUNT(*) FROM users')
    ]);
    
    const remaining = parseInt(sourceUsers.rows[0].count) - parseInt(targetUsers.rows[0].count);
    console.log(`Completing ${remaining} remaining users...`);
    
    // Get users not yet transferred
    const missingUsers = await sourcePool.query(`
      SELECT s.* FROM users s 
      LEFT JOIN (SELECT id FROM users LIMIT ${parseInt(targetUsers.rows[0].count)}) t ON s.id = t.id 
      WHERE t.id IS NULL 
      ORDER BY s.id
    `);
    
    // Insert remaining users quickly
    for (const user of missingUsers.rows) {
      await targetPool.query(`
        INSERT INTO users (id, username, email, password, first_name, last_name, profile_image_url, role, last_login_at, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO NOTHING
      `, [user.id, user.username, user.email, user.password, user.first_name, user.last_name, user.profile_image_url, user.role, user.last_login_at, user.is_active, user.created_at, user.updated_at]);
    }
    
    // Quick transfer other tables
    const tables = [
      { name: 'destinations', hasSequence: true },
      { name: 'bookings', hasSequence: true },
      { name: 'reviews', hasSequence: true },
      { name: 'activity_logs', hasSequence: true },
      { name: 'sessions', hasSequence: false }
    ];
    
    for (const table of tables) {
      console.log(`Transferring ${table.name}...`);
      
      const sourceData = await sourcePool.query(`SELECT * FROM ${table.name} ORDER BY ${table.hasSequence ? 'id' : '1'}`);
      await targetPool.query(`TRUNCATE ${table.name} ${table.hasSequence ? 'RESTART IDENTITY CASCADE' : 'CASCADE'}`);
      
      for (const row of sourceData.rows) {
        const columns = Object.keys(row);
        const values = columns.map(col => {
          if (row[col] && typeof row[col] === 'object') {
            return JSON.stringify(row[col]);
          }
          return row[col];
        });
        
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        const query = `INSERT INTO ${table.name} (${columns.join(', ')}) VALUES (${placeholders})`;
        
        await targetPool.query(query, values);
      }
      
      if (table.hasSequence) {
        await targetPool.query(`SELECT setval('${table.name}_id_seq', (SELECT COALESCE(MAX(id), 1) FROM ${table.name}))`);
      }
    }
    
    // Final verification
    console.log('\nVerification:');
    const allTables = ['users', 'destinations', 'bookings', 'reviews', 'activity_logs', 'sessions'];
    
    for (const table of allTables) {
      const [src, tgt] = await Promise.all([
        sourcePool.query(`SELECT COUNT(*) FROM ${table}`),
        targetPool.query(`SELECT COUNT(*) FROM ${table}`)
      ]);
      
      const srcCount = parseInt(src.rows[0].count);
      const tgtCount = parseInt(tgt.rows[0].count);
      console.log(`${table}: ${srcCount} -> ${tgtCount} ${srcCount === tgtCount ? 'SUCCESS' : 'MISMATCH'}`);
    }
    
    console.log('\nMigration completed!');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sourcePool.end();
    await targetPool.end();
  }
}

quickComplete();