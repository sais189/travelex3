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

function safeParseInt(value) {
  if (!value || value === '\\N' || value === 'null') return null;
  const cleaned = cleanValue(value);
  if (!cleaned) return null;
  
  const parsed = parseInt(cleaned);
  return isNaN(parsed) ? null : parsed;
}

function safeParseFloat(value) {
  if (!value || value === '\\N' || value === 'null') return null;
  const cleaned = cleanValue(value);
  if (!cleaned) return null;
  
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}

async function fixDestinations() {
  console.log('🔄 Fixing destinations migration...');
  
  const csvContent = fs.readFileSync('destinations.csv', 'utf8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  const client = await pool.connect();
  
  try {
    let successCount = 0;
    
    for (const line of lines) {
      const fields = parseCSVLine(line);
      
      if (fields.length < 10) {
        console.log('Skipping line with insufficient fields:', fields.slice(0, 3));
        continue;
      }
      
      const [id, name, country, description, shortDescription, imageUrl, price, duration, distanceKm, rating, reviewCount, maxGuests, isActive, features, itinerary, createdAt, updatedAt, originalPrice, discountPercentage, promoTag, promoExpiry, discountType, seasonalTag, flashSale, flashSaleEnd, couponCode, groupDiscountMin, loyaltyDiscount, bundleDeal] = fields;
      
      let featuresJson = null;
      let itineraryJson = null;
      let bundleDealJson = null;
      
      try {
        if (features && features !== '\\N') {
          featuresJson = JSON.parse(features.replace(/'/g, '"'));
        }
      } catch (e) {
        console.log('Warning: Could not parse features for destination:', cleanValue(name));
      }
      
      try {
        if (itinerary && itinerary !== '\\N') {
          itineraryJson = JSON.parse(itinerary.replace(/'/g, '"'));
        }
      } catch (e) {
        console.log('Warning: Could not parse itinerary for destination:', cleanValue(name));
      }
      
      try {
        if (bundleDeal && bundleDeal !== '\\N') {
          bundleDealJson = JSON.parse(bundleDeal.replace(/'/g, '"'));
        }
      } catch (e) {
        console.log('Warning: Could not parse bundle deal for destination:', cleanValue(name));
      }
      
      const query = `
        INSERT INTO destinations (id, name, country, description, short_description, image_url, price, duration, distance_km, rating, review_count, max_guests, is_active, features, itinerary, created_at, updated_at, original_price, discount_percentage, promo_tag, promo_expiry, discount_type, seasonal_tag, flash_sale, flash_sale_end, coupon_code, group_discount_min, loyalty_discount, bundle_deal)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          country = EXCLUDED.country,
          description = EXCLUDED.description,
          short_description = EXCLUDED.short_description,
          image_url = EXCLUDED.image_url,
          price = EXCLUDED.price,
          duration = EXCLUDED.duration,
          distance_km = EXCLUDED.distance_km,
          rating = EXCLUDED.rating,
          review_count = EXCLUDED.review_count,
          max_guests = EXCLUDED.max_guests,
          is_active = EXCLUDED.is_active,
          features = EXCLUDED.features,
          itinerary = EXCLUDED.itinerary,
          updated_at = EXCLUDED.updated_at,
          original_price = EXCLUDED.original_price,
          discount_percentage = EXCLUDED.discount_percentage,
          promo_tag = EXCLUDED.promo_tag,
          promo_expiry = EXCLUDED.promo_expiry,
          discount_type = EXCLUDED.discount_type,
          seasonal_tag = EXCLUDED.seasonal_tag,
          flash_sale = EXCLUDED.flash_sale,
          flash_sale_end = EXCLUDED.flash_sale_end,
          coupon_code = EXCLUDED.coupon_code,
          group_discount_min = EXCLUDED.group_discount_min,
          loyalty_discount = EXCLUDED.loyalty_discount,
          bundle_deal = EXCLUDED.bundle_deal
      `;
      
      try {
        await client.query(query, [
          safeParseInt(id),
          cleanValue(name),
          cleanValue(country),
          cleanValue(description),
          cleanValue(shortDescription),
          cleanValue(imageUrl),
          safeParseFloat(price),
          safeParseInt(duration),
          safeParseFloat(distanceKm),
          safeParseFloat(rating) || 0,
          safeParseInt(reviewCount) || 0,
          safeParseInt(maxGuests) || 2,
          cleanValue(isActive) === 'true' ? true : false,
          featuresJson,
          itineraryJson,
          cleanValue(createdAt),
          cleanValue(updatedAt),
          safeParseFloat(originalPrice),
          safeParseInt(discountPercentage) || 0,
          cleanValue(promoTag),
          cleanValue(promoExpiry),
          cleanValue(discountType) || 'percentage',
          cleanValue(seasonalTag),
          cleanValue(flashSale) === 'true' ? true : false,
          cleanValue(flashSaleEnd),
          cleanValue(couponCode),
          safeParseInt(groupDiscountMin) || 0,
          safeParseInt(loyaltyDiscount) || 0,
          bundleDealJson
        ]);
        
        successCount++;
      } catch (error) {
        console.log('Error inserting destination:', cleanValue(name), error.message);
      }
    }
    
    console.log(`✅ Successfully migrated ${successCount} destinations`);
  } catch (error) {
    console.error('❌ Error migrating destinations:', error);
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await fixDestinations();
    console.log('🎉 Destinations migration completed!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await pool.end();
  }
}

main();