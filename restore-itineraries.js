#!/usr/bin/env node

import { Pool } from 'pg';
import fs from 'fs';
import { parse } from 'csv-parse';

const DATABASE_URL = "postgresql://sai_j16q_user:Ktz9XhfvegcunhDBccYng71gUSfvoFvY@dpg-d1ss8amr433s73emf0l0-a.singapore-postgres.render.com/sai_j16q?sslmode=require";

const pool = new Pool({
  connectionString: DATABASE_URL,
});

async function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(parse({
        delimiter: '\t',
        relax: true,
        skip_empty_lines: true,
        quote: '"',
        escape: '"'
      }))
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

function parseItinerary(itineraryStr) {
  if (!itineraryStr || itineraryStr === '\\N') {
    return [];
  }
  
  try {
    // Remove extra quotes and clean up the string
    let cleanStr = itineraryStr.replace(/^"|"$/g, '');
    cleanStr = cleanStr.replace(/""/g, '"');
    
    // Parse the JSON array
    const itinerary = JSON.parse(cleanStr);
    
    // Ensure it's an array
    if (!Array.isArray(itinerary)) {
      console.warn('Itinerary is not an array:', itinerary);
      return [];
    }
    
    return itinerary;
  } catch (error) {
    console.error('Error parsing itinerary:', error.message);
    console.error('Raw itinerary string:', itineraryStr);
    return [];
  }
}

async function restoreItineraries() {
  try {
    console.log('🔄 Starting itinerary restoration...');
    
    // Read CSV file
    const csvData = await parseCSV('destinations.csv');
    console.log(`📊 Found ${csvData.length} destinations in CSV`);
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const row of csvData) {
      try {
        const [
          id, name, country, description, shortDesc, imageUrl, price, duration,
          originalPrice, rating, reviewCount, duration2, isActive, highlights,
          itineraryStr, createdAt, updatedAt, salePrice, discountPercent, saleType,
          saleEndDate, promoType, promoDesc, isLimitedTime, limitedTimeEnd,
          couponCode, popularity, rating2, upgradeOption
        ] = row;
        
        // Parse itinerary
        const itinerary = parseItinerary(itineraryStr);
        
        if (itinerary.length === 0) {
          console.log(`⚠️  No itinerary found for destination ${id} (${name})`);
          continue;
        }
        
        // Update destination with itinerary
        const updateQuery = `
          UPDATE destinations 
          SET itinerary = $1, updated_at = NOW()
          WHERE id = $2
        `;
        
        await pool.query(updateQuery, [JSON.stringify(itinerary), parseInt(id)]);
        
        console.log(`✅ Updated itinerary for destination ${id}: ${name} (${itinerary.length} days)`);
        updatedCount++;
        
      } catch (error) {
        console.error(`❌ Error updating destination ${row[0]}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n🎉 Itinerary restoration complete!`);
    console.log(`✅ Successfully updated: ${updatedCount} destinations`);
    console.log(`❌ Errors: ${errorCount} destinations`);
    
  } catch (error) {
    console.error('❌ Fatal error during itinerary restoration:', error);
  } finally {
    await pool.end();
  }
}

// Run the restoration
restoreItineraries();