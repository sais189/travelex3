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
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (!inQuotes && (char === '"' || char === "'")) {
      inQuotes = true;
      quoteChar = char;
    } else if (inQuotes && char === quoteChar) {
      if (i + 1 < line.length && line[i + 1] === quoteChar) {
        current += char;
        i++;
      } else {
        inQuotes = false;
        quoteChar = null;
      }
    } else if (!inQuotes && char === '\t') {
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
  
  if ((value.startsWith('"') && value.endsWith('"')) || 
      (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  
  value = value.replace(/""/g, '"').replace(/''/g, "'");
  return value;
}

function truncateString(str, maxLength) {
  if (!str) return str;
  return str.length > maxLength ? str.substring(0, maxLength) : str;
}

async function fixReviews() {
  console.log('🔄 Fixing reviews migration...');
  
  const csvContent = fs.readFileSync('reviews.csv', 'utf8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  const client = await pool.connect();
  
  try {
    let successCount = 0;
    
    for (const line of lines) {
      const fields = parseCSVLine(line);
      
      if (fields.length < 8) {
        console.log('Skipping line with insufficient fields');
        continue;
      }
      
      const [id, destinationId, userId, rating, title, comment, tripDate, createdAt, updatedAt] = fields;
      
      const query = `
        INSERT INTO reviews (id, destination_id, user_id, rating, title, comment, trip_date, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO UPDATE SET
          destination_id = EXCLUDED.destination_id,
          user_id = EXCLUDED.user_id,
          rating = EXCLUDED.rating,
          title = EXCLUDED.title,
          comment = EXCLUDED.comment,
          trip_date = EXCLUDED.trip_date,
          updated_at = EXCLUDED.updated_at
      `;
      
      try {
        await client.query(query, [
          parseInt(cleanValue(id)),
          parseInt(cleanValue(destinationId)),
          cleanValue(userId),
          parseInt(cleanValue(rating)),
          truncateString(cleanValue(title), 255), // Truncate title to 255 chars
          cleanValue(comment),
          cleanValue(tripDate),
          cleanValue(createdAt),
          cleanValue(updatedAt)
        ]);
        
        successCount++;
      } catch (error) {
        console.log('Error inserting review:', cleanValue(id), error.message);
      }
    }
    
    console.log(`✅ Successfully migrated ${successCount} reviews`);
  } catch (error) {
    console.error('❌ Error migrating reviews:', error);
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await fixReviews();
    console.log('🎉 Reviews migration completed!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await pool.end();
  }
}

main();