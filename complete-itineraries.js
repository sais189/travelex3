#!/usr/bin/env node

import { Pool } from 'pg';

const DATABASE_URL = "postgresql://sai_j16q_user:Ktz9XhfvegcunhDBccYng71gUSfvoFvY@dpg-d1ss8amr433s73emf0l0-a.singapore-postgres.render.com/sai_j16q?sslmode=require";

const pool = new Pool({
  connectionString: DATABASE_URL,
});

// Complete itinerary data for all remaining destinations
const completeItineraryData = {
  1: [
    {"day":1,"title":"Arrival in Chiang Mai","description":"Land in the cultural heart of Northern Thailand, traditional temple visits, night market exploration"},
    {"day":2,"title":"Elephant Sanctuary","description":"Ethical elephant interactions, feeding and bathing experiences, conservation education"},
    {"day":3,"title":"Hill Tribe Villages","description":"Trek to remote hill tribe communities, learn traditional crafts, overnight in tribal homestay"},
    {"day":4,"title":"Cooking & Culture","description":"Thai cooking classes, spice market tours, traditional dance performances"},
    {"day":5,"title":"Golden Triangle","description":"Visit the famous Golden Triangle, Mekong River cruise, ancient temples exploration"},
    {"day":6,"title":"Jungle Adventure","description":"Bamboo rafting, jungle trekking, waterfall swimming, wildlife spotting"},
    {"day":7,"title":"Departure","description":"Final temple blessings, souvenir shopping, farewell dinner with traditional music"}
  ],
  
  3: [
    {"day":1,"title":"Arrival in Arusha","description":"Meet your guide, safari briefing, equipment check, drive to Serengeti"},
    {"day":2,"title":"Central Serengeti","description":"Full day game drive, big cat tracking, picnic lunch on the plains"},
    {"day":3,"title":"Great Migration","description":"Follow wildebeest herds, river crossing witnesses, photography sessions"},
    {"day":4,"title":"Ngorongoro Crater","description":"Descend into the crater, rhino tracking, Maasai village visit"},
    {"day":5,"title":"Cultural Immersion","description":"Traditional warrior ceremonies, beadwork workshops, tribal meals"},
    {"day":6,"title":"Final Safari","description":"Last game drive, souvenir shopping, farewell dinner"}
  ],
  
  4: [
    {"day":1,"title":"Arrival in Quito","description":"Acclimatization in Ecuador's capital, colonial city tour, traditional markets"},
    {"day":2,"title":"Amazon Entry","description":"Flight to Coca, motorized canoe to eco-lodge, jungle introduction"},
    {"day":3,"title":"Canopy Walk","description":"Treetop canopy walk, bird watching, medicinal plant tour"},
    {"day":4,"title":"Indigenous Culture","description":"Visit Shuar community, traditional crafts, rainforest survival skills"},
    {"day":5,"title":"Galápagos Flight","description":"Fly to Galápagos, giant tortoise encounter, Darwin Research Station"},
    {"day":6,"title":"Island Hopping","description":"Boat tours, marine iguana watching, snorkeling with sea lions"},
    {"day":7,"title":"Blue-footed Boobies","description":"Wildlife photography, hiking volcanic trails, evening departure"}
  ],
  
  8: [
    {"day":1,"title":"Arrival in Banff","description":"Mountain town exploration, gondola ride, welcome dinner"},
    {"day":2,"title":"Lake Louise","description":"Iconic turquoise lake, canoeing, Fairmont Chateau visit"},
    {"day":3,"title":"Moraine Lake","description":"Valley of Ten Peaks, hiking trails, photography sessions"},
    {"day":4,"title":"Jasper National Park","description":"Athabasca Falls, Columbia Icefield, glacier walk"},
    {"day":5,"title":"Wildlife Safari","description":"Bear watching, elk encounters, mountain goat spotting"},
    {"day":6,"title":"Hot Springs","description":"Natural hot springs soak, spa treatments, mountain views"},
    {"day":7,"title":"Departure","description":"Final mountain views, souvenir shopping, farewell breakfast"}
  ],
  
  10: [
    {"day":1,"title":"Arrival in Agra","description":"Taj Mahal sunrise visit, marble inlay workshop, Mughal cuisine"},
    {"day":2,"title":"Delhi Exploration","description":"Red Fort, Jama Masjid, rickshaw ride through Old Delhi"},
    {"day":3,"title":"Rajasthan Journey","description":"Train to Jaipur, City Palace visit, traditional puppet show"},
    {"day":4,"title":"Pink City","description":"Hawa Mahal, Amber Fort, elephant ride, jewelry shopping"},
    {"day":5,"title":"Desert Safari","description":"Camel trekking, sand dunes, desert camping under stars"},
    {"day":6,"title":"Cultural Immersion","description":"Traditional village visit, folk dance, handicraft workshops"},
    {"day":7,"title":"Mumbai Departure","description":"Flight to Mumbai, Gateway of India, Bollywood tour"}
  ],
  
  11: [
    {"day":1,"title":"Arrival in Cusco","description":"Altitude acclimatization, San Pedro Market, coca tea ceremony"},
    {"day":2,"title":"Sacred Valley","description":"Pisac ruins, traditional weaving demonstration, Ollantaytambo"},
    {"day":3,"title":"Machu Picchu","description":"Early morning train, guided tour of ancient citadel, Huayna Picchu hike"},
    {"day":4,"title":"Cusco Culture","description":"Cathedral visit, San Blas neighborhood, pisco sour tasting"},
    {"day":5,"title":"Rainbow Mountain","description":"Vinicunca trek, llama encounters, high altitude photography"},
    {"day":6,"title":"Departure","description":"Final alpaca shopping, farewell dinner, cultural show"}
  ],
  
  12: [
    {"day":1,"title":"Arrival in Cairo","description":"Pyramids of Giza, Sphinx encounter, camel ride experience"},
    {"day":2,"title":"Egyptian Museum","description":"Tutankhamun treasures, mummy rooms, ancient artifacts"},
    {"day":3,"title":"Nile Cruise","description":"Luxor temple visits, Valley of the Kings, hot air balloon"},
    {"day":4,"title":"Abu Simbel","description":"Ramses II temples, Nubian culture, desert landscapes"},
    {"day":5,"title":"Aswan Experience","description":"Philae Temple, felucca sailing, Nubian village visit"},
    {"day":6,"title":"Red Sea","description":"Hurghada relaxation, coral reef snorkeling, desert sunset"},
    {"day":7,"title":"Departure","description":"Final bazaar shopping, traditional farewell dinner"}
  ],
  
  13: [
    {"day":1,"title":"Arrival in Lhasa","description":"Altitude adjustment, Potala Palace visit, prayer wheel spinning"},
    {"day":2,"title":"Jokhang Temple","description":"Sacred temple pilgrimage, Barkhor Street, butter tea tasting"},
    {"day":3,"title":"Monastery Life","description":"Sera Monastery, monk debates, traditional ceremonies"},
    {"day":4,"title":"Yamdrok Lake","description":"Turquoise high-altitude lake, yak herding, mountain views"},
    {"day":5,"title":"Everest Base Camp","description":"Drive to base camp, world's highest peak views, prayer flags"},
    {"day":6,"title":"Tibetan Culture","description":"Traditional medicine, thangka painting, nomad family visit"},
    {"day":7,"title":"Departure","description":"Final mountain blessings, souvenir shopping, farewell ceremony"}
  ],
  
  15: [
    {"day":1,"title":"Arrival in Reykjavik","description":"Blue Lagoon geothermal spa, northern lights briefing"},
    {"day":2,"title":"Golden Circle","description":"Geysir eruptions, Gullfoss waterfall, Thingvellir National Park"},
    {"day":3,"title":"South Coast","description":"Seljalandsfoss, Skogafoss, black sand beaches, ice caves"},
    {"day":4,"title":"Glacier Adventure","description":"Glacier hiking, ice climbing, diamond beach icebergs"},
    {"day":5,"title":"Northern Lights","description":"Aurora hunting, photography workshop, traditional feast"},
    {"day":6,"title":"Departure","description":"Final hot springs, volcano bread tasting, farewell"}
  ],
  
  16: [
    {"day":1,"title":"Arrival in Hanoi","description":"Old Quarter exploration, street food tour, water puppet show"},
    {"day":2,"title":"Ha Long Bay","description":"Cruise through limestone karsts, kayaking, cave exploration"},
    {"day":3,"title":"Sapa Mountains","description":"Rice terrace trekking, ethnic minority villages, homestay"},
    {"day":4,"title":"Hue Imperial City","description":"Ancient citadel, royal tombs, dragon boat cruise"},
    {"day":5,"title":"Hoi An Charm","description":"Ancient town walking, lantern festival, cooking class"},
    {"day":6,"title":"Mekong Delta","description":"Floating markets, coconut candy making, river cruise"},
    {"day":7,"title":"Saigon Departure","description":"War museum, Cu Chi tunnels, street food farewell"}
  ],
  
  17: [
    {"day":1,"title":"Arrival in Marrakech","description":"Jemaa el-Fnaa square, snake charmers, traditional hammam"},
    {"day":2,"title":"Desert Journey","description":"Camel trekking, sand dunes, Berber camp overnight"},
    {"day":3,"title":"Atlas Mountains","description":"Berber villages, mint tea ceremony, mountain hiking"},
    {"day":4,"title":"Fez Medina","description":"Ancient medina maze, leather tanneries, traditional crafts"},
    {"day":5,"title":"Coastal Casablanca","description":"Hassan II Mosque, Atlantic coast, Art Deco architecture"},
    {"day":6,"title":"Departure","description":"Final souk shopping, traditional farewell dinner"}
  ],
  
  18: [
    {"day":1,"title":"Arrival in Athens","description":"Acropolis tour, Parthenon views, traditional taverna"},
    {"day":2,"title":"Santorini Ferry","description":"Volcanic island, blue domes, sunset in Oia"},
    {"day":3,"title":"Mykonos Party","description":"Beach clubs, windmills, traditional fishing village"},
    {"day":4,"title":"Delphi Oracle","description":"Ancient ruins, Temple of Apollo, mountain views"},
    {"day":5,"title":"Meteora Monasteries","description":"Rock formations, Byzantine monasteries, spiritual retreat"},
    {"day":6,"title":"Departure","description":"Final Greek salad, souvenir shopping, farewell"}
  ],
  
  19: [
    {"day":1,"title":"Arrival in Bangkok","description":"Grand Palace, Wat Pho temple, river cruise"},
    {"day":2,"title":"Floating Markets","description":"Damnoen Saduak, longtail boats, exotic fruits"},
    {"day":3,"title":"Ancient Ayutthaya","description":"Historical ruins, elephant rides, traditional shows"},
    {"day":4,"title":"Chiang Mai Culture","description":"Temple hopping, night bazaar, traditional massage"},
    {"day":5,"title":"Elephant Sanctuary","description":"Ethical elephant care, feeding, bathing experiences"},
    {"day":6,"title":"Departure","description":"Final temple blessings, street food tour, farewell"}
  ],
  
  20: [
    {"day":1,"title":"Arrival in Rome","description":"Colosseum, Roman Forum, gelato tasting"},
    {"day":2,"title":"Vatican City","description":"Sistine Chapel, St. Peter's Basilica, papal audience"},
    {"day":3,"title":"Florence Art","description":"Uffizi Gallery, Michelangelo's David, Ponte Vecchio"},
    {"day":4,"title":"Tuscan Countryside","description":"Wine tasting, olive groves, medieval towns"},
    {"day":5,"title":"Venice Canals","description":"Gondola rides, St. Mark's Square, Murano glass"},
    {"day":6,"title":"Departure","description":"Final pasta dinner, souvenir shopping, arrivederci"}
  ],
  
  22: [
    {"day":1,"title":"Arrival in Rio","description":"Christ the Redeemer, Sugarloaf Mountain, samba show"},
    {"day":2,"title":"Copacabana Beach","description":"Beach volleyball, caipirinha cocktails, sunset views"},
    {"day":3,"title":"Amazon Rainforest","description":"Jungle lodge, pink dolphins, indigenous culture"},
    {"day":4,"title":"Iguazu Falls","description":"Thundering waterfalls, rainbow mists, jungle walks"},
    {"day":5,"title":"Buenos Aires","description":"Tango dancing, steak dinners, colorful neighborhoods"},
    {"day":6,"title":"Departure","description":"Final carnival parade, souvenir shopping, tchau"}
  ],
  
  23: [
    {"day":1,"title":"Arrival in Dubai","description":"Burj Khalifa, desert safari, camel riding"},
    {"day":2,"title":"Luxury Shopping","description":"Gold souk, spice markets, luxury malls"},
    {"day":3,"title":"Desert Adventure","description":"Dune bashing, sandboarding, Bedouin dinner"},
    {"day":4,"title":"Cultural Heritage","description":"Old Dubai, dhow cruise, traditional crafts"},
    {"day":5,"title":"Modern Marvels","description":"Palm Jumeirah, underwater aquarium, fountain show"},
    {"day":6,"title":"Departure","description":"Final luxury spa, gold shopping, farewell feast"}
  ],
  
  24: [
    {"day":1,"title":"Arrival in Seoul","description":"Gyeongbokgung Palace, Bukchon Hanok Village, Korean BBQ"},
    {"day":2,"title":"Modern Seoul","description":"Gangnam district, K-pop culture, shopping districts"},
    {"day":3,"title":"DMZ Experience","description":"Korean War history, border tour, peace village"},
    {"day":4,"title":"Busan Coastal","description":"Seaside temples, fish markets, beach relaxation"},
    {"day":5,"title":"Traditional Culture","description":"Temple stays, meditation, traditional tea ceremony"},
    {"day":6,"title":"Departure","description":"Final kimchi making, souvenir shopping, annyeong"}
  ],
  
  25: [
    {"day":1,"title":"Arrival in Istanbul","description":"Blue Mosque, Hagia Sophia, Grand Bazaar"},
    {"day":2,"title":"Bosphorus Cruise","description":"European and Asian sides, palace views, Turkish bath"},
    {"day":3,"title":"Cappadocia","description":"Hot air balloon, fairy chimneys, underground cities"},
    {"day":4,"title":"Pamukkale","description":"White travertine terraces, thermal pools, ancient ruins"},
    {"day":5,"title":"Ephesus","description":"Ancient Greek ruins, Library of Celsus, Roman theater"},
    {"day":6,"title":"Departure","description":"Final Turkish delight, carpet shopping, güle güle"}
  ],
  
  26: [
    {"day":1,"title":"Arrival in Kyoto","description":"Golden Pavilion, bamboo forest, traditional tea ceremony"},
    {"day":2,"title":"Geisha District","description":"Gion walking, geisha spotting, traditional dinner"},
    {"day":3,"title":"Mount Fuji","description":"Sacred mountain views, lake cruise, hot springs"},
    {"day":4,"title":"Tokyo Modern","description":"Shibuya crossing, robot restaurant, neon districts"},
    {"day":5,"title":"Cultural Immersion","description":"Sumo wrestling, sake tasting, temple meditation"},
    {"day":6,"title":"Departure","description":"Final sushi breakfast, souvenir shopping, sayonara"}
  ],
  
  27: [
    {"day":1,"title":"Arrival in São Paulo","description":"Street art tours, coffee culture, vibrant nightlife"},
    {"day":2,"title":"Amazon Entry","description":"Manaus boat cruise, jungle lodge, wildlife spotting"},
    {"day":3,"title":"Indigenous Culture","description":"Tribal visits, traditional crafts, rainforest medicine"},
    {"day":4,"title":"Rio de Janeiro","description":"Copacabana, Christ statue, samba dancing"},
    {"day":5,"title":"Iguazu Falls","description":"Waterfalls, rainbow mists, jungle adventure"},
    {"day":6,"title":"Departure","description":"Final caipirinha, beach volleyball, até logo"}
  ],
  
  28: [
    {"day":1,"title":"Arrival in Bergen","description":"Colorful wooden houses, fish market, fjord introduction"},
    {"day":2,"title":"Geiranger Fjord","description":"Seven Sisters waterfall, scenic cruise, mountain views"},
    {"day":3,"title":"Flam Railway","description":"Steepest train ride, valley views, traditional villages"},
    {"day":4,"title":"Lofoten Islands","description":"Fishing villages, midnight sun, dramatic peaks"},
    {"day":5,"title":"Northern Lights","description":"Aurora hunting, Sami culture, reindeer encounters"},
    {"day":6,"title":"Departure","description":"Final salmon dinner, wool shopping, ha det bra"}
  ],
  
  29: [
    {"day":1,"title":"Arrival in Queenstown","description":"Bungee jumping, lake views, adventure briefing"},
    {"day":2,"title":"Milford Sound","description":"Fjord cruise, waterfalls, seal colonies"},
    {"day":3,"title":"Skydiving","description":"Tandem jumps, mountain views, adrenaline rush"},
    {"day":4,"title":"Wine Country","description":"Central Otago vineyards, wine tasting, scenic drives"},
    {"day":5,"title":"Glacier Helicopter","description":"Franz Josef glacier, helicopter tours, ice walks"},
    {"day":6,"title":"Departure","description":"Final adventure photos, souvenir shopping, kia ora"}
  ],
  
  30: [
    {"day":1,"title":"Arrival in Nairobi","description":"Giraffe center, elephant orphanage, safari preparation"},
    {"day":2,"title":"Masai Mara","description":"Great migration, big five tracking, luxury tents"},
    {"day":3,"title":"Cultural Village","description":"Masai warriors, traditional dances, beadwork"},
    {"day":4,"title":"Amboseli","description":"Kilimanjaro views, elephant herds, acacia trees"},
    {"day":5,"title":"Lake Nakuru","description":"Flamingo flocks, rhino sanctuary, bird watching"},
    {"day":6,"title":"Departure","description":"Final game drive, coffee plantation, kwaheri"}
  ],
  
  31: [
    {"day":1,"title":"Arrival in Zurich","description":"Lake views, old town, Swiss chocolate tasting"},
    {"day":2,"title":"Jungfraujoch","description":"Top of Europe, snow activities, mountain railways"},
    {"day":3,"title":"Matterhorn","description":"Zermatt village, iconic peak views, hiking trails"},
    {"day":4,"title":"Lake Geneva","description":"Vineyards, boat cruises, international atmosphere"},
    {"day":5,"title":"Alpine Adventure","description":"Cable cars, mountain huts, traditional cuisine"},
    {"day":6,"title":"Departure","description":"Final fondue dinner, watch shopping, auf wiedersehen"}
  ],
  
  34: [
    {"day":1,"title":"Arrival in Quito","description":"Colonial architecture, equator monument, market visits"},
    {"day":2,"title":"Amazon Lodge","description":"Jungle canopy, bird watching, indigenous guides"},
    {"day":3,"title":"Galápagos Flight","description":"Santa Cruz Island, giant tortoises, Darwin Station"},
    {"day":4,"title":"Marine Life","description":"Snorkeling, sea lions, marine iguanas"},
    {"day":5,"title":"Española Island","description":"Blue-footed boobies, albatross, volcanic landscapes"},
    {"day":6,"title":"Departure","description":"Final wildlife photos, conservation center, adiós"}
  ],
  
  35: [
    {"day":1,"title":"Arrival in Oslo","description":"Viking museums, royal palace, fjord introduction"},
    {"day":2,"title":"Flam Railway","description":"Scenic train, waterfall views, mountain villages"},
    {"day":3,"title":"Geiranger Fjord","description":"UNESCO site, Seven Sisters, dramatic cliffs"},
    {"day":4,"title":"Lofoten Islands","description":"Fishing villages, midnight sun, arctic beauty"},
    {"day":5,"title":"Northern Lights","description":"Aurora photography, Sami culture, reindeer"},
    {"day":6,"title":"Departure","description":"Final salmon meal, northern crafts, ha det"}
  ],
  
  36: [
    {"day":1,"title":"Arrival in Amman","description":"Roman theater, citadel views, Middle Eastern cuisine"},
    {"day":2,"title":"Petra Wonder","description":"Rose-red city, Treasury, monastery hike"},
    {"day":3,"title":"Wadi Rum","description":"Desert landscapes, Bedouin camps, star gazing"},
    {"day":4,"title":"Dead Sea","description":"Floating experience, mud treatments, lowest point"},
    {"day":5,"title":"Jerash Ruins","description":"Roman ruins, ancient theaters, historical sites"},
    {"day":6,"title":"Departure","description":"Final Arabic coffee, handicrafts, ma'a salama"}
  ]
};

async function restoreAllItineraries() {
  try {
    console.log('🔄 Starting complete itinerary restoration...');
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const [destinationId, itinerary] of Object.entries(completeItineraryData)) {
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
    
    console.log(`\n🎉 Complete itinerary restoration finished!`);
    console.log(`✅ Successfully updated: ${updatedCount} destinations`);
    console.log(`❌ Errors: ${errorCount} destinations`);
    
  } catch (error) {
    console.error('❌ Fatal error during complete itinerary restoration:', error);
  } finally {
    await pool.end();
  }
}

// Run the restoration
restoreAllItineraries();