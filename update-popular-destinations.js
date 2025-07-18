#!/usr/bin/env node

import { Pool } from 'pg';

const DATABASE_URL = "postgresql://sai_j16q_user:Ktz9XhfvegcunhDBccYng71gUSfvoFvY@dpg-d1ss8amr433s73emf0l0-a.singapore-postgres.render.com/sai_j16q?sslmode=require";

const pool = new Pool({
  connectionString: DATABASE_URL,
});

async function updatePopularDestinations() {
  try {
    console.log('🔄 Making destinations more popular...');
    
    // Update Maldives Luxury Resort (highest popularity)
    const maldivesResult = await pool.query(
      `UPDATE destinations SET review_count = 1500, rating = 4.9, updated_at = NOW() WHERE name = 'Maldives Luxury Resort' RETURNING name, review_count, rating;`
    );
    
    // Update Tokyo Cherry Blossom Trip (second highest)
    const tokyoResult = await pool.query(
      `UPDATE destinations SET review_count = 1400, rating = 4.8, updated_at = NOW() WHERE name = 'Tokyo Cherry Blossom Trip' RETURNING name, review_count, rating;`
    );
    
    // Update Rajasthan Palace Tour (third highest)
    const rajasthanResult = await pool.query(
      `UPDATE destinations SET review_count = 1300, rating = 4.7, updated_at = NOW() WHERE name = 'Rajasthan Palace Tour' RETURNING name, review_count, rating;`
    );
    
    console.log('✅ Updated popular destinations:');
    if (maldivesResult.rows.length > 0) {
      const dest = maldivesResult.rows[0];
      console.log(`   🏝️  ${dest.name}: ${dest.review_count} reviews, ${dest.rating} rating`);
    } else {
      console.log('   ❌ Maldives Luxury Resort not found');
    }
    
    if (tokyoResult.rows.length > 0) {
      const dest = tokyoResult.rows[0];
      console.log(`   🌸 ${dest.name}: ${dest.review_count} reviews, ${dest.rating} rating`);
    } else {
      console.log('   ❌ Tokyo Cherry Blossom Trip not found');
    }
    
    if (rajasthanResult.rows.length > 0) {
      const dest = rajasthanResult.rows[0];
      console.log(`   🏰 ${dest.name}: ${dest.review_count} reviews, ${dest.rating} rating`);
    } else {
      console.log('   ❌ Rajasthan Palace Tour not found');
    }
    
    console.log('\n🎉 Popularity update complete!');
    
  } catch (error) {
    console.error('❌ Error updating popular destinations:', error);
  } finally {
    await pool.end();
  }
}

// Run the update
updatePopularDestinations();