import { Pool } from 'pg';

const pool = new Pool({
  connectionString: "postgresql://travelex_postgresqldatabase_89r4_user:xtn0p5OdhfhWDTPxBNEsvnBTOEeuLpaQ@dpg-d1e921p5pdvs73bqamvg-a.singapore-postgres.render.com/travelex_postgresqldatabase_89r4",
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkAndUpdateRankings() {
  console.log('🔍 Checking destination rankings...');
  
  const client = await pool.connect();
  
  try {
    // Check all destinations
    const allDestinations = await client.query(
      'SELECT id, name, rating, review_count FROM destinations ORDER BY rating DESC, review_count DESC'
    );
    
    console.log('📊 Current destinations in database:');
    allDestinations.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.name} - Rating: ${row.rating}, Reviews: ${row.review_count}`);
    });
    
    // Update the rankings to ensure the desired order
    const updates = [
      { name: 'Maldives Luxury Resort', rating: 4.95, reviewCount: 1500 },
      { name: 'Tokyo Cherry Blossom Trip', rating: 4.92, reviewCount: 1400 },
      { name: 'Rajasthan Palace Tour', rating: 4.90, reviewCount: 1300 }
    ];
    
    console.log('\n🔄 Updating destination rankings...');
    
    for (const update of updates) {
      const updateQuery = `
        UPDATE destinations 
        SET rating = $1, review_count = $2, updated_at = NOW()
        WHERE name = $3
      `;
      
      const result = await client.query(updateQuery, [update.rating, update.reviewCount, update.name]);
      console.log(`✅ Updated ${result.rowCount} destination: ${update.name}`);
    }
    
    // Verify the final rankings
    console.log('\n📊 Final destination rankings:');
    const finalRankings = await client.query(
      'SELECT id, name, rating, review_count FROM destinations ORDER BY rating DESC, review_count DESC LIMIT 15'
    );
    
    finalRankings.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.name} - Rating: ${row.rating}, Reviews: ${row.review_count}`);
    });
    
    console.log('\n✅ Top 3 destinations should now be:');
    console.log('1. Maldives Luxury Resort');
    console.log('2. Tokyo Cherry Blossom Trip');
    console.log('3. Rajasthan Palace Tour');
    
  } catch (error) {
    console.error('❌ Error checking rankings:', error);
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await checkAndUpdateRankings();
    console.log('\n🎉 Rankings update completed!');
  } catch (error) {
    console.error('❌ Update failed:', error);
  } finally {
    await pool.end();
  }
}

main();