import { Pool } from 'pg';

// Your PostgreSQL database connection
const DATABASE_URL = 'postgresql://sai_j16q_user:Ktz9XhfvegcunhDBccYng71gUSfvoFvY@dpg-d1ss8amr433s73emf0l0-a.singapore-postgres.render.com/sai_j16q';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testRenderDatabase() {
  const client = await pool.connect();
  try {
    console.log('🔄 Testing your PostgreSQL database connection...');
    
    // Check if tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('📊 Tables in database:', tablesResult.rows.map(row => row.table_name));
    
    // Check data counts
    const tables = ['destinations', 'users', 'bookings', 'reviews', 'activity_logs', 'sessions'];
    for (const table of tables) {
      try {
        const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`✅ ${table}: ${result.rows[0].count} rows`);
      } catch (error) {
        console.log(`❌ ${table}: Table not found or error - ${error.message}`);
      }
    }
    
    // Get sample data
    try {
      const sampleDestinations = await client.query('SELECT id, name FROM destinations LIMIT 3');
      console.log('📍 Sample destinations:', sampleDestinations.rows);
    } catch (error) {
      console.log('❌ Error getting sample destinations:', error.message);
    }
    
    console.log('✅ Database test completed!');
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

testRenderDatabase().catch(console.error);