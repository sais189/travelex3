import { pool } from './server/db.ts';

async function testConnection() {
  const client = await pool.connect();
  try {
    console.log('🔄 Testing database connection...');
    
    const result = await client.query('SELECT COUNT(*) FROM destinations');
    console.log('✅ Destinations count:', result.rows[0].count);
    
    const sample = await client.query('SELECT id, name FROM destinations LIMIT 3');
    console.log('📍 Sample destinations:', sample.rows);
    
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    console.log('👥 Users count:', userCount.rows[0].count);
    
    console.log('✅ Database connection successful!');
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

testConnection().catch(console.error);