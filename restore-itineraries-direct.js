#!/usr/bin/env node

import { Pool } from 'pg';

const DATABASE_URL = "postgresql://sai_j16q_user:Ktz9XhfvegcunhDBccYng71gUSfvoFvY@dpg-d1ss8amr433s73emf0l0-a.singapore-postgres.render.com/sai_j16q?sslmode=require";

const pool = new Pool({
  connectionString: DATABASE_URL,
});

// Complete itinerary data for all destinations
const itineraryData = {
  6: [
    {"day":1,"title":"Cuzco Acclimatization","description":"Arrive in Sacred Valley, altitude adjustment, local market exploration and quinoa cooking class"},
    {"day":2,"title":"Trail Beginning","description":"Start Inca Trail trek, ancient terraces exploration, llama encounters on mountain paths"},
    {"day":3,"title":"Cloud Forest Trek","description":"Misty cloud forest hiking, orchid discovery, camping at high altitude with Andean views"},
    {"day":4,"title":"Dead Womans Pass","description":"Highest point crossing at 4,215m, condor sightings, ancient Inca ruins exploration"},
    {"day":5,"title":"Machu Picchu Sunrise","description":"Dawn entry through Sun Gate, guided tour of ancient citadel, huayna picchu climb"},
    {"day":6,"title":"Sacred Valley Return","description":"Traditional weaving workshop, alpaca farm visit, farewell ceremony with local guides"}
  ],
  
  38: [
    {"day":"Day 1","title":"Arrival in Tokyo","description":"Welcome to the neon capital of the world"},
    {"day":"Day 2","title":"Shibuya & Harajuku","description":"Explore youth culture and fashion districts"}
  ],
  
  40: [
    {"day":"Day 1","title":"Arrival & Welcome Ceremony","description":"Traditional Balinese welcome ritual"},
    {"day":"Day 2","title":"Sunrise Yoga","description":"Morning practice overlooking rice terraces"}
  ],
  
  39: [
    {"day":"Day 1","title":"Base Camp Setup","description":"Establish camp in the heart of Patagonia"},
    {"day":"Day 2","title":"Glacier Trekking","description":"Hike to ancient glacial formations"}
  ],
  
  21: [
    {"day":1,"title":"Serengeti Entry Gates","description":"Fly to Kilimanjaro, drive to Serengeti National Park, afternoon game drive with wildebeest herds introduction"},
    {"day":2,"title":"Great Migration Spectacle","description":"Dawn game drive following massive wildebeest and zebra herds, witness river crossings with crocodile encounters"},
    {"day":3,"title":"Big Cat Predator Focus","description":"Track lions and cheetahs hunting migrating herds, photograph dramatic predator-prey interactions"},
    {"day":4,"title":"Mara River Crossing","description":"Position at famous crossing points, witness thousands of animals braving crocodile-infested waters"},
    {"day":5,"title":"Maasai Cultural Exchange","description":"Visit traditional Maasai village, learn warrior traditions, participate in traditional dances and ceremonies"},
    {"day":6,"title":"Ngorongoro Crater","description":"Descend into world largest intact volcanic caldera, spot rare black rhinos and flamingo-filled lakes"},
    {"day":7,"title":"Conservation Education","description":"Meet wildlife researchers, learn about migration patterns and conservation efforts protecting this natural wonder"},
    {"day":8,"title":"Final Migration Views","description":"Last chance photography of endless herds, traditional Tanzanian farewell feast, departure to Kilimanjaro"}
  ],
  
  7: [
    {"day":1,"title":"Reykjavik & Blue Lagoon","description":"Arrive in Iceland capital, explore colorful downtown, evening soak in geothermal Blue Lagoon spa with silica mud masks"},
    {"day":2,"title":"Golden Circle Classic","description":"Visit Thingvellir National Park where continents meet, Geysir hot spring eruptions, powerful Gullfoss waterfall"},
    {"day":3,"title":"South Coast Wonders","description":"Seljalandsfoss and Skogafoss waterfalls, black sand beaches of Reynisfjara, puffin colonies at Dyrholaey arch"},
    {"day":4,"title":"Glacier Adventure","description":"Glacier hiking on Solheimajokull with crampons, ice cave exploration, diamond beach with icebergs"},
    {"day":5,"title":"Northern Lights Hunt","description":"Evening aurora hunting tour, photography workshop, traditional Icelandic feast with fermented shark tasting"},
    {"day":6,"title":"Westfjords & Hot Springs","description":"Remote Westfjords exploration, natural hot springs bathing, dramatic cliff bird watching"},
    {"day":7,"title":"Farewell Aurora","description":"Final northern lights opportunity, traditional Icelandic wool shopping, geothermal bakery bread, departure"}
  ],
  
  9: [
    {"day":1,"title":"Sydney to Red Centre","description":"Fly from Sydney to Alice Springs, Outback orientation tour, traditional Aboriginal welcome ceremony, desert sunset viewing"},
    {"day":2,"title":"Uluru Sacred Experience","description":"Sunrise at Uluru (Ayers Rock), base walk with Aboriginal guide learning Dreamtime stories, cultural center visit"},
    {"day":3,"title":"Kata Tjuta Exploration","description":"Explore Valley of the Winds at Kata Tjuta (The Olgas), Aboriginal art workshops, bush tucker tasting"},
    {"day":4,"title":"Kings Canyon Adventure","description":"Rim walk at Kings Canyon, swim in permanent rock pools, helicopter flight over MacDonnell Ranges"},
    {"day":5,"title":"Outback Station Life","description":"Working cattle station experience, horseback riding, campfire cooking, swagman sleeping under stars"},
    {"day":6,"title":"Desert Wildlife Safari","description":"Search for bilbies, echidnas, and kangaroos, visit Alice Springs Desert Park, camel trekking experience"},
    {"day":7,"title":"Aboriginal Art & Culture","description":"Visit renowned Aboriginal art galleries, meet local artists, participate in traditional painting workshops"},
    {"day":8,"title":"Coober Pedy Underground","description":"Drive to opal mining town, explore underground homes and churches, try opal fossicking"},
    {"day":9,"title":"Flinders Ranges","description":"Dramatic mountain landscapes, fossil hunting, visit historic Blinman mine, spectacular gorge walks"},
    {"day":10,"title":"Outback Farewell","description":"Final sunrise over red earth, authentic bush breakfast, return flight to Sydney with unforgettable memories"}
  ],
  
  33: [
    {"day":1,"title":"Dublin Castle Tour","description":"Explore medieval Dublin Castle, traditional Irish breakfast, evening folk music session"},
    {"day":2,"title":"Ring of Kerry Drive","description":"Scenic coastal drive, ancient stone circles, traditional Irish pub lunch"},
    {"day":3,"title":"Cliffs of Moher","description":"Dramatic cliff walks, puffin watching, traditional Irish storytelling"},
    {"day":4,"title":"Castle Hopping","description":"Visit Kilkenny Castle, medieval banquet, falconry demonstration"},
    {"day":5,"title":"Countryside Exploration","description":"Rolling green hills, sheep herding demo, traditional craft workshops"},
    {"day":6,"title":"Whiskey Distillery","description":"Irish whiskey tasting, distillery tour, traditional Irish music lessons"},
    {"day":7,"title":"Departure","description":"Final countryside views, traditional Irish farewell ceremony"}
  ],
  
  14: [
    {"day":1,"title":"Arrival in Kathmandu","description":"Fly into Lukla airport, meet your Sherpa guide, and begin the trek through traditional villages"},
    {"day":2,"title":"Trek to Namche Bazaar","description":"Cross suspension bridges over glacial rivers and ascend through rhododendron forests"},
    {"day":3,"title":"Acclimatization Day","description":"Explore Sherpa culture, visit local monasteries, and prepare for higher altitudes"},
    {"day":4,"title":"Trek to Tengboche","description":"Visit the famous Tengboche monastery with spectacular mountain views"},
    {"day":5,"title":"Journey to Dingboche","description":"Trek through alpine terrain with breathtaking Himalayan panoramas"},
    {"day":6,"title":"Everest Base Camp","description":"Reach the legendary base camp and witness sunrise over the world's highest peaks"},
    {"day":7,"title":"Return Journey","description":"Descend through mountain villages back to Lukla for departure"}
  ],
  
  5: [
    {"day":1,"title":"Arrival in Nairobi","description":"Safari briefing, equipment check, drive to Maasai Mara National Reserve"},
    {"day":2,"title":"Big Five Safari Drive","description":"Early morning game drive, lion and elephant tracking, Maasai village cultural visit"},
    {"day":3,"title":"Great Migration Witness","description":"Wildebeest river crossing observation, cheetah hunting experience, sunset photography"},
    {"day":4,"title":"Conservation Experience","description":"Rhino sanctuary visit, anti-poaching patrol participation, wildlife conservation education"},
    {"day":5,"title":"Maasai Cultural Immersion","description":"Traditional warrior ceremonies, beadwork workshops, authentic tribal meals"},
    {"day":6,"title":"Amboseli Elephant Haven","description":"Mount Kilimanjaro backdrop photography, elephant family observation, research station visit"},
    {"day":7,"title":"Safari Conclusion","description":"Final game drive, souvenir shopping at local markets, return to Nairobi"}
  ],
  
  2: [
    {"day":1,"title":"Arrival in Paradise","description":"Seaplane arrival to resort, welcome ceremony, overwater villa check-in"},
    {"day":2,"title":"Coral Reef Snorkeling","description":"Guided snorkeling tour, tropical fish encounters, coral garden exploration"},
    {"day":3,"title":"Island Hopping","description":"Traditional dhoni boat tours, sandbank picnics, dolphin watching"},
    {"day":4,"title":"Spa & Wellness","description":"Overwater spa treatments, yoga sessions, meditation at sunset"},
    {"day":5,"title":"Cultural Experience","description":"Local island visit, traditional fishing, Maldivian cooking class"},
    {"day":6,"title":"Water Sports","description":"Diving lessons, kayaking, windsurfing, beach volleyball"},
    {"day":7,"title":"Farewell Sunset","description":"Sunset dinner cruise, final beach relaxation, seaplane departure"}
  ]
};

async function restoreItineraries() {
  try {
    console.log('🔄 Starting itinerary restoration...');
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const [destinationId, itinerary] of Object.entries(itineraryData)) {
      try {
        const updateQuery = `
          UPDATE destinations 
          SET itinerary = $1, updated_at = NOW()
          WHERE id = $2
          RETURNING name
        `;
        
        const result = await pool.query(updateQuery, [JSON.stringify(itinerary), parseInt(destinationId)]);
        
        if (result.rows.length > 0) {
          console.log(`✅ Updated itinerary for destination ${destinationId}: ${result.rows[0].name} (${itinerary.length} days)`);
          updatedCount++;
        } else {
          console.log(`⚠️  Destination ${destinationId} not found in database`);
        }
        
      } catch (error) {
        console.error(`❌ Error updating destination ${destinationId}:`, error.message);
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