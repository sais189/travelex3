#!/usr/bin/env node
import pkg from 'pg';
const { Pool } = pkg;

const sourcePool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 2
});

const targetPool = new Pool({
  connectionString: 'postgresql://Travelex1_owner:npg_Gdv6fZW7mjzt@ep-long-glade-a20tplti-pooler.eu-central-1.aws.neon.tech/Travelex1?sslmode=require',
  max: 2
});

async function migrateUsers() {
  try {
    console.log('Migrating users table...');
    
    const sourceData = await sourcePool.query('SELECT * FROM users ORDER BY id');
    const users = sourceData.rows;
    console.log(`Found ${users.length} users to migrate`);
    
    await targetPool.query('DELETE FROM users');
    
    let migrated = 0;
    for (const user of users) {
      try {
        await targetPool.query(`
          INSERT INTO users (id, username, email, password, first_name, last_name, profile_image_url, role, last_login_at, is_active, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `, [
          user.id, user.username, user.email, user.password, user.first_name, 
          user.last_name, user.profile_image_url, user.role, user.last_login_at, 
          user.is_active, user.created_at, user.updated_at
        ]);
        migrated++;
      } catch (error) {
        console.error(`Error migrating user ${user.id}:`, error.message);
      }
    }
    
    console.log(`Users migrated: ${migrated}/${users.length}`);
    
  } catch (error) {
    console.error('Users migration failed:', error.message);
  } finally {
    await sourcePool.end();
    await targetPool.end();
  }
}

migrateUsers();