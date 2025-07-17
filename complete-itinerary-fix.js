import { Pool } from 'pg';
import fs from 'fs';

const pool = new Pool({
  connectionString: "postgresql://travelex_postgresqldatabase_89r4_user:xtn0p5OdhfhWDTPxBNEsvnBTOEeuLpaQ@dpg-d1e921p5pdvs73bqamvg-a.singapore-postgres.render.com/travelex_postgresqldatabase_89r4",
  ssl: {
    rejectUnauthorized: false
  }
});

function parseCSVLine(line) {
  const fields = line.split('\t');
  return fields.map(field => field.trim());
}

function parseItineraryFromString(itineraryStr) {
  if (!itineraryStr || itineraryStr === '\\N' || itineraryStr === 'null') {
    return null;
  }
  
  try {
    // Handle the specific format from the CSV
    let cleaned = itineraryStr.replace(/^"(.*)"$/, '$1'); // Remove outer quotes
    cleaned = cleaned.replace(/""/g, '"'); // Unescape quotes
    
    // Replace single quotes with double quotes for proper JSON
    cleaned = cleaned.replace(/'/g, '"');
    
    // Try to parse as JSON
    const parsed = JSON.parse(cleaned);
    
    if (Array.isArray(parsed)) {
      return parsed;
    }
    
    return null;
  } catch (error) {
    console.log('Failed to parse itinerary:', error.message);
    return null;
  }
}

async function analyzeCurrentState() {
  console.log('🔍 Analyzing current itinerary state...');
  
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT id, name, itinerary
      FROM destinations 
      ORDER BY id
    `);
    
    console.log('\n📊 Current Itinerary Status:');
    let withItinerary = 0;
    let withoutItinerary = 0;
    let emptyItinerary = 0;
    
    result.rows.forEach(row => {
      if (!row.itinerary) {
        console.log(`❌ ${row.name} (ID: ${row.id}) - No itinerary`);
        withoutItinerary++;
      } else if (Array.isArray(row.itinerary) && row.itinerary.length === 0) {
        console.log(`⚠️  ${row.name} (ID: ${row.id}) - Empty itinerary array`);
        emptyItinerary++;
      } else {
        console.log(`✅ ${row.name} (ID: ${row.id}) - Has ${row.itinerary.length} days`);
        withItinerary++;
      }
    });
    
    console.log(`\n📈 Summary:`);
    console.log(`   With itinerary: ${withItinerary}`);
    console.log(`   Empty itinerary: ${emptyItinerary}`);
    console.log(`   Without itinerary: ${withoutItinerary}`);
    console.log(`   Total: ${result.rows.length}`);
    
    return result.rows;
  } finally {
    client.release();
  }
}

async function processCSVAndRestoreItineraries() {
  console.log('\n🔄 Processing CSV file for itinerary restoration...');
  
  const csvContent = fs.readFileSync('destinations.csv', 'utf8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  const client = await pool.connect();
  let restored = 0;
  
  try {
    for (const line of lines) {
      const fields = parseCSVLine(line);
      
      if (fields.length < 15) {
        console.log('⚠️  Line has insufficient fields, skipping');
        continue;
      }
      
      const [id, name, country, description, shortDescription, imageUrl, price, duration, 
            distanceKm, rating, reviewCount, maxGuests, isActive, features, itinerary] = fields;
      
      const destinationId = parseInt(id);
      const destinationName = name;
      
      if (!destinationId || !destinationName) {
        console.log('⚠️  Invalid destination data, skipping');
        continue;
      }
      
      // Parse itinerary
      const itineraryData = parseItineraryFromString(itinerary);
      
      if (itineraryData && itineraryData.length > 0) {
        try {
          // Check if this destination exists and needs itinerary
          const existingResult = await client.query(
            'SELECT id, name, itinerary FROM destinations WHERE id = $1',
            [destinationId]
          );
          
          if (existingResult.rows.length > 0) {
            const existing = existingResult.rows[0];
            const needsUpdate = !existing.itinerary || 
                              (Array.isArray(existing.itinerary) && existing.itinerary.length === 0);
            
            if (needsUpdate) {
              await client.query(
                'UPDATE destinations SET itinerary = $1, updated_at = NOW() WHERE id = $2',
                [JSON.stringify(itineraryData), destinationId]
              );
              
              console.log(`✅ Restored ${itineraryData.length}-day itinerary for: ${destinationName}`);
              restored++;
            } else {
              console.log(`ℹ️  ${destinationName} already has itinerary (${existing.itinerary.length} days)`);
            }
          } else {
            console.log(`⚠️  Destination ${destinationName} (ID: ${destinationId}) not found in database`);
          }
        } catch (error) {
          console.log(`❌ Error processing ${destinationName}: ${error.message}`);
        }
      } else {
        console.log(`⚠️  No valid itinerary found for: ${destinationName}`);
      }
    }
    
    console.log(`\n📊 Restoration Results:`);
    console.log(`   Itineraries restored: ${restored}`);
    
  } finally {
    client.release();
  }
}

async function main() {
  try {
    const currentState = await analyzeCurrentState();
    await processCSVAndRestoreItineraries();
    
    console.log('\n🔍 Final verification...');
    await analyzeCurrentState();
    
    console.log('\n🎉 Itinerary restoration process completed!');
  } catch (error) {
    console.error('❌ Process failed:', error);
  } finally {
    await pool.end();
  }
}

main();