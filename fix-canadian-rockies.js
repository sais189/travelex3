import { Pool } from 'pg';

const pool = new Pool({
  connectionString: "postgresql://travelex_postgresqldatabase_89r4_user:xtn0p5OdhfhWDTPxBNEsvnBTOEeuLpaQ@dpg-d1e921p5pdvs73bqamvg-a.singapore-postgres.render.com/travelex_postgresqldatabase_89r4",
  ssl: {
    rejectUnauthorized: false
  }
});

const canadianRockiesItinerary = [
  {
    "day": 1,
    "title": "Calgary to Banff National Park",
    "description": "Arrive in Calgary, drive scenic Highway 1 to Banff National Park, check into mountain lodge with stunning Rocky Mountain views, evening orientation and equipment check for upcoming adventures"
  },
  {
    "day": 2,
    "title": "Lake Louise & Moraine Lake",
    "description": "Early morning canoe paddle on turquoise Lake Louise, hike to Moraine Lake viewpoint for iconic photography, afternoon tea at Fairmont Chateau Lake Louise with glacier views"
  },
  {
    "day": 3,
    "title": "Icefields Parkway Adventure",
    "description": "Drive world-famous Icefields Parkway, visit Athabasca Glacier with ice walking experience, Peyto Lake viewpoint, wildlife spotting including mountain goats and bighorn sheep"
  },
  {
    "day": 4,
    "title": "Jasper National Park Exploration",
    "description": "Transfer to Jasper National Park, Maligne Lake boat cruise to Spirit Island, search for grizzly bears and black bears, evening campfire with park rangers"
  },
  {
    "day": 5,
    "title": "Glacier Hiking & Ice Caves",
    "description": "Guided glacier hiking with crampons on ancient ice formations, explore natural ice caves, alpine meadow wildflower walks, mountain photography workshop"
  },
  {
    "day": 6,
    "title": "Wilderness Camping Experience",
    "description": "Backcountry camping under pristine starlit skies, campfire cooking with local ingredients, storytelling session about First Nations heritage and mountain legends"
  },
  {
    "day": 7,
    "title": "Mountain Wildlife Safari",
    "description": "Dawn elk and moose watching expedition, visit mountain research station, learn about conservation efforts, helicopter tour over pristine wilderness areas"
  },
  {
    "day": 8,
    "title": "Departure & Farewell",
    "description": "Final sunrise over the Canadian Rockies, souvenir shopping in historic Banff town, traditional Canadian farewell brunch, transfer to Calgary airport with lifelong memories"
  }
];

async function fixCanadianRockiesItinerary() {
  console.log('🔄 Adding itinerary for Canadian Rockies Adventure...');
  
  const client = await pool.connect();
  
  try {
    // First, check if the destination exists
    const checkResult = await client.query('SELECT id, name FROM destinations WHERE id = 4');
    
    if (checkResult.rows.length === 0) {
      console.log('❌ Canadian Rockies Adventure destination not found in database');
      return;
    }
    
    console.log(`✅ Found destination: ${checkResult.rows[0].name}`);
    
    // Update the itinerary
    const updateResult = await client.query(
      'UPDATE destinations SET itinerary = $1, updated_at = NOW() WHERE id = 4',
      [JSON.stringify(canadianRockiesItinerary)]
    );
    
    if (updateResult.rowCount > 0) {
      console.log('✅ Successfully added 8-day itinerary for Canadian Rockies Adventure');
      
      // Verify the update
      const verifyResult = await client.query(
        'SELECT id, name, jsonb_array_length(itinerary) as day_count FROM destinations WHERE id = 4'
      );
      
      if (verifyResult.rows.length > 0) {
        console.log(`✅ Verification: ${verifyResult.rows[0].name} now has ${verifyResult.rows[0].day_count} days`);
      }
    } else {
      console.log('❌ Failed to update itinerary');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await fixCanadianRockiesItinerary();
    console.log('🎉 Canadian Rockies Adventure itinerary fix completed!');
  } catch (error) {
    console.error('❌ Operation failed:', error);
  } finally {
    await pool.end();
  }
}

main();