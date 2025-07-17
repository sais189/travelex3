import { Pool } from 'pg';

const pool = new Pool({
  connectionString: "postgresql://travelex_postgresqldatabase_89r4_user:xtn0p5OdhfhWDTPxBNEsvnBTOEeuLpaQ@dpg-d1e921p5pdvs73bqamvg-a.singapore-postgres.render.com/travelex_postgresqldatabase_89r4",
  ssl: {
    rejectUnauthorized: false
  }
});

async function updatePopularity() {
  console.log('🔄 Updating destination popularity rankings...');
  
  const client = await pool.connect();
  
  try {
    // First, let's see what destinations we have
    const checkQuery = 'SELECT id, name, rating, review_count FROM destinations ORDER BY name';
    const checkResult = await client.query(checkQuery);
    
    if (checkResult.rows.length === 0) {
      console.log('No destinations found in database. Inserting sample data...');
      
      // Insert the three most popular destinations
      const insertDestinations = `
        INSERT INTO destinations (id, name, country, description, image_url, price, duration, rating, review_count, max_guests, is_active, created_at, updated_at)
        VALUES 
          (1, 'Maldives Luxury Resort', 'Maldives', 'Experience ultimate luxury in overwater bungalows with crystal-clear waters', 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd', 5999.00, 7, 4.9, 1250, 4, true, NOW(), NOW()),
          (2, 'Tokyo Cherry Blossom Trip', 'Japan', 'Witness the magical cherry blossoms in Tokyo during the perfect spring season', 'https://images.unsplash.com/photo-1522559254594-4b6613639ad', 3499.00, 8, 4.8, 1180, 6, true, NOW(), NOW()),
          (3, 'Rajasthan Palace Tour', 'India', 'Explore magnificent palaces and rich culture of Rajasthan', 'https://images.unsplash.com/photo-1587474260584-136574528ed5', 2899.00, 10, 4.7, 1050, 8, true, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
          rating = EXCLUDED.rating,
          review_count = EXCLUDED.review_count,
          updated_at = NOW()
      `;
      
      await client.query(insertDestinations);
      console.log('✅ Inserted/updated top 3 destinations');
    } else {
      console.log('Found destinations in database:', checkResult.rows.length);
      
      // Update existing destinations to boost popularity
      const updates = [
        { name: 'Maldives%', rating: 4.9, reviewCount: 1250 },
        { name: 'Tokyo%Cherry%', rating: 4.8, reviewCount: 1180 },
        { name: 'Rajasthan%Palace%', rating: 4.7, reviewCount: 1050 }
      ];
      
      for (const update of updates) {
        const updateQuery = `
          UPDATE destinations 
          SET rating = $1, review_count = $2, updated_at = NOW()
          WHERE name ILIKE $3
        `;
        
        const result = await client.query(updateQuery, [update.rating, update.reviewCount, update.name]);
        console.log(`✅ Updated ${result.rowCount} destination(s) matching: ${update.name}`);
      }
    }
    
    // Verify the updates
    const verifyQuery = `
      SELECT id, name, rating, review_count 
      FROM destinations 
      WHERE name ILIKE '%maldives%' OR name ILIKE '%tokyo%' OR name ILIKE '%rajasthan%' 
      ORDER BY rating DESC, review_count DESC
    `;
    
    const verifyResult = await client.query(verifyQuery);
    console.log('📊 Updated popularity rankings:');
    verifyResult.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.name} - Rating: ${row.rating}, Reviews: ${row.review_count}`);
    });
    
  } catch (error) {
    console.error('❌ Error updating popularity:', error);
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await updatePopularity();
    console.log('🎉 Popularity update completed!');
  } catch (error) {
    console.error('❌ Update failed:', error);
  } finally {
    await pool.end();
  }
}

main();