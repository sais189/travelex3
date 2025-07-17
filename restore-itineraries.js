import { Pool } from 'pg';
import fs from 'fs';

const pool = new Pool({
  connectionString: "postgresql://travelex_postgresqldatabase_89r4_user:xtn0p5OdhfhWDTPxBNEsvnBTOEeuLpaQ@dpg-d1e921p5pdvs73bqamvg-a.singapore-postgres.render.com/travelex_postgresqldatabase_89r4",
  ssl: {
    rejectUnauthorized: false
  }
});

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = null;
  let bracketCount = 0;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '[' || char === '{') {
      bracketCount++;
      current += char;
    } else if (char === ']' || char === '}') {
      bracketCount--;
      current += char;
    } else if (!inQuotes && bracketCount === 0 && (char === '"' || char === "'")) {
      inQuotes = true;
      quoteChar = char;
      current += char;
    } else if (inQuotes && char === quoteChar) {
      if (i + 1 < line.length && line[i + 1] === quoteChar) {
        current += char;
        i++;
      } else {
        inQuotes = false;
        quoteChar = null;
      }
      current += char;
    } else if (!inQuotes && bracketCount === 0 && char === '\t') {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

function cleanValue(value) {
  if (!value || value === '\\N' || value === 'null') return null;
  
  // Remove outer quotes if present
  if ((value.startsWith('"') && value.endsWith('"')) || 
      (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  
  // Unescape quotes
  value = value.replace(/""/g, '"').replace(/''/g, "'");
  return value;
}

function parseItineraryJson(itineraryStr) {
  if (!itineraryStr || itineraryStr === '\\N') return null;
  
  try {
    // Clean the string first
    let cleaned = cleanValue(itineraryStr);
    if (!cleaned) return null;
    
    // Fix common JSON issues
    cleaned = cleaned
      .replace(/'/g, '"')  // Replace single quotes with double quotes
      .replace(/""([^"]+)""/g, '"$1"')  // Fix escaped quotes
      .replace(/\n/g, ' ')  // Remove newlines
      .replace(/\r/g, '')   // Remove carriage returns
      .replace(/\t/g, ' ')  // Replace tabs with spaces
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
    
    // Attempt to parse
    const parsed = JSON.parse(cleaned);
    
    // Validate structure
    if (Array.isArray(parsed)) {
      return parsed.map(item => ({
        day: item.day || item.Day || 1,
        title: item.title || item.Title || 'Day Activity',
        description: item.description || item.Description || 'Activity description'
      }));
    }
    
    return null;
  } catch (error) {
    console.log('JSON parsing error for itinerary:', error.message);
    return null;
  }
}

async function restoreItineraries() {
  console.log('🔄 Restoring missing itinerary data...');
  
  const csvContent = fs.readFileSync('destinations.csv', 'utf8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  const client = await pool.connect();
  
  try {
    let restoredCount = 0;
    let totalProcessed = 0;
    
    for (const line of lines) {
      const fields = parseCSVLine(line);
      
      if (fields.length < 15) {
        console.log('Skipping line with insufficient fields');
        continue;
      }
      
      const [id, name, country, description, shortDescription, imageUrl, price, duration, distanceKm, rating, reviewCount, maxGuests, isActive, features, itinerary] = fields;
      
      const cleanedId = parseInt(cleanValue(id));
      const cleanedName = cleanValue(name);
      
      if (!cleanedId || !cleanedName) continue;
      
      totalProcessed++;
      
      // Parse itinerary
      const itineraryData = parseItineraryJson(itinerary);
      
      if (itineraryData) {
        try {
          const updateQuery = `
            UPDATE destinations 
            SET itinerary = $1, updated_at = NOW()
            WHERE id = $2
          `;
          
          await client.query(updateQuery, [JSON.stringify(itineraryData), cleanedId]);
          console.log(`✅ Restored itinerary for: ${cleanedName}`);
          restoredCount++;
        } catch (error) {
          console.log(`❌ Error updating itinerary for ${cleanedName}:`, error.message);
        }
      } else {
        console.log(`⚠️ No valid itinerary found for: ${cleanedName}`);
      }
    }
    
    console.log(`\n📊 Restoration Summary:`);
    console.log(`   Total destinations processed: ${totalProcessed}`);
    console.log(`   Itineraries successfully restored: ${restoredCount}`);
    console.log(`   Destinations without itineraries: ${totalProcessed - restoredCount}`);
    
  } catch (error) {
    console.error('❌ Error during restoration:', error);
  } finally {
    client.release();
  }
}

async function verifyItineraries() {
  console.log('\n🔍 Verifying restored itineraries...');
  
  const client = await pool.connect();
  
  try {
    const result = await client.query(`
      SELECT 
        id, 
        name, 
        CASE 
          WHEN itinerary IS NULL THEN 'Missing'
          WHEN itinerary::text = 'null' THEN 'Null'
          ELSE 'Present'
        END as itinerary_status
      FROM destinations 
      ORDER BY id
    `);
    
    let withItinerary = 0;
    let withoutItinerary = 0;
    
    console.log('\n📋 Itinerary Status by Destination:');
    result.rows.forEach(row => {
      const status = row.itinerary_status === 'Present' ? '✅' : '❌';
      console.log(`   ${status} ${row.name} (ID: ${row.id})`);
      
      if (row.itinerary_status === 'Present') {
        withItinerary++;
      } else {
        withoutItinerary++;
      }
    });
    
    console.log(`\n📈 Final Statistics:`);
    console.log(`   Destinations with itineraries: ${withItinerary}`);
    console.log(`   Destinations without itineraries: ${withoutItinerary}`);
    console.log(`   Total destinations: ${result.rows.length}`);
    
  } catch (error) {
    console.error('❌ Error during verification:', error);
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await restoreItineraries();
    await verifyItineraries();
    console.log('\n🎉 Itinerary restoration completed!');
  } catch (error) {
    console.error('❌ Restoration failed:', error);
  } finally {
    await pool.end();
  }
}

main();