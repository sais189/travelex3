import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Clock, 
  Camera, 
  Mountain, 
  Waves, 
  TreePine, 
  Coffee, 
  Heart, 
  Sparkles,
  Sun,
  Castle,
  Fish,
  TreePalm
} from "lucide-react";
import { RobustImage } from "@/components/ui/robust-image";
import PDFExport from "@/components/PDFExport";

// Landmark images for each specific destination
const DESTINATION_LANDMARK_IMAGES = {
  // Maldives Luxury Resort (ID: 2)
  "maldives_luxury_resort": {
    day1: "https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?w=800&h=600&fit=crop&auto=format&q=80", // Overwater bungalows
    day2: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=800&h=600&fit=crop&auto=format&q=80", // Infinity pool villa
    day3: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop&auto=format&q=80", // Coral reef diving
    day4: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&h=600&fit=crop&auto=format&q=80", // Sunset beach
    day5: "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=800&h=600&fit=crop&auto=format&q=80", // Seaplane transfer
    day6: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800&h=600&fit=crop&auto=format&q=80", // Private beach dinner
    day7: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop&auto=format&q=80", // Romantic sunset cruise
    fallback: "https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?w=800&h=600&fit=crop&auto=format&q=80"
  },
  
  // Tokyo Adventure (ID: 3)
  "tokyo_adventure": {
    day1: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&h=600&fit=crop&auto=format&q=80", // Tokyo skyline
    day2: "https://images.unsplash.com/photo-1480796927426-f609979314bd?w=800&h=600&fit=crop&auto=format&q=80", // Shibuya crossing
    day3: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=600&fit=crop&auto=format&q=80", // Sensoji Temple
    day4: "https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=800&h=600&fit=crop&auto=format&q=80", // Golden Pavilion
    day5: "https://images.unsplash.com/photo-1570459027562-4a916cc6113f?w=800&h=600&fit=crop&auto=format&q=80", // Mount Fuji
    day6: "https://images.unsplash.com/photo-1554797589-7241bb691973?w=800&h=600&fit=crop&auto=format&q=80", // Cherry blossoms
    day7: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&h=600&fit=crop&auto=format&q=80", // Meiji Shrine
    fallback: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&h=600&fit=crop&auto=format&q=80"
  },
  
  // Himalayan Expedition (ID: 4)
  "himalayan_expedition": {
    day1: "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=800&h=600&fit=crop&auto=format&q=80", // Everest Base Camp
    day2: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=600&fit=crop&auto=format&q=80", // Mountain monastery
    day3: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=600&fit=crop&auto=format&q=80", // Prayer flags
    day4: "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=800&h=600&fit=crop&auto=format&q=80", // Sherpa village
    day5: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&h=600&fit=crop&auto=format&q=80", // Mountain trekking path
    day6: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop&auto=format&q=80", // Himalayan sunrise peaks
    day7: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&h=600&fit=crop&auto=format&q=80", // Kathmandu valley departure
    fallback: "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=800&h=600&fit=crop&auto=format&q=80"
  },
  
  // African Safari (ID: 5)
  "african_safari": {
    day1: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&h=600&fit=crop&auto=format&q=80", // Elephants migration
    day2: "https://images.unsplash.com/photo-1566555110834-0af5e5cf38c5?w=800&h=600&fit=crop&auto=format&q=80", // Zebra herds
    day3: "https://images.unsplash.com/photo-1566649112285-e6d2e8cd3c5b?w=800&h=600&fit=crop&auto=format&q=80", // Giraffe at sunset
    day4: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=800&h=600&fit=crop&auto=format&q=80", // Masai culture
    day5: "https://images.unsplash.com/photo-1549318441-e6324cbb769e?w=800&h=600&fit=crop&auto=format&q=80", // African sunset
    day6: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&h=600&fit=crop&auto=format&q=80", // Lions pride
    day7: "https://images.unsplash.com/photo-1564149504063-338de52293c6?w=800&h=600&fit=crop&auto=format&q=80", // Safari camp
    fallback: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&h=600&fit=crop&auto=format&q=80"
  },
  
  // Iceland Adventure (ID: 6)
  "iceland_adventure": {
    day1: "https://images.unsplash.com/photo-1551524164-6cf96ac834fb?w=800&h=600&fit=crop&auto=format&q=80", // Gullfoss waterfall
    day2: "https://images.unsplash.com/photo-1539650116574-75c0c6d90469?w=800&h=600&fit=crop&auto=format&q=80", // Geysir eruption
    day3: "https://images.unsplash.com/photo-1573160813959-df05c19ffc85?w=800&h=600&fit=crop&auto=format&q=80", // Blue Lagoon
    day4: "https://images.unsplash.com/photo-1565214075252-4dc0b7ab3e40?w=800&h=600&fit=crop&auto=format&q=80", // Diamond Beach
    day5: "https://images.unsplash.com/photo-1569163139394-de4e6d43e4e5?w=800&h=600&fit=crop&auto=format&q=80", // Black sand beach
    day6: "https://images.unsplash.com/photo-1578401572462-f6c5b2d39c48?w=800&h=600&fit=crop&auto=format&q=80", // Aurora Borealis
    day7: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop&auto=format&q=80", // Skaftafell glacier
    fallback: "https://images.unsplash.com/photo-1551524164-6cf96ac834fb?w=800&h=600&fit=crop&auto=format&q=80"
  },
  
  // Swiss Alps (ID: 7)
  "swiss_alps": {
    day1: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&h=600&fit=crop&auto=format&q=80", // Matterhorn peak
    day2: "https://images.unsplash.com/photo-1527004760525-c46ddf7e4438?w=800&h=600&fit=crop&auto=format&q=80", // Swiss village
    day3: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&h=600&fit=crop&auto=format&q=80", // Alpine lake
    day4: "https://images.unsplash.com/photo-1507809781116-65c95a3a6d4b?w=800&h=600&fit=crop&auto=format&q=80", // Cable car
    day5: "https://images.unsplash.com/photo-1505841512822-bddf79a048c5?w=800&h=600&fit=crop&auto=format&q=80", // Mountain meadow
    day6: "https://images.unsplash.com/photo-1528728329032-2972f65dfb3f?w=800&h=600&fit=crop&auto=format&q=80", // Traditional chalet
    day7: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=600&fit=crop&auto=format&q=80", // Alpine sunset
    fallback: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&h=600&fit=crop&auto=format&q=80"
  },
  
  // Great Barrier Reef (ID: 8)
  "great_barrier_reef": {
    day1: "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=800&h=600&fit=crop&auto=format&q=80", // Coral reef aerial
    day2: "https://images.unsplash.com/photo-1582967788606-a171c1080cb0?w=800&h=600&fit=crop&auto=format&q=80", // Underwater coral
    day3: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800&h=600&fit=crop&auto=format&q=80", // Diving experience
    day4: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop&auto=format&q=80", // Marine life
    day5: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800&h=600&fit=crop&auto=format&q=80", // Snorkeling tour
    day6: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&auto=format&q=80", // Tropical beach
    day7: "https://images.unsplash.com/photo-1471919743851-c4df8b6ee585?w=800&h=600&fit=crop&auto=format&q=80", // Sunset sail
    fallback: "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=800&h=600&fit=crop&auto=format&q=80"
  },
  
  // Australian Outback (ID: 9)
  "australian_outback": {
    day1: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&auto=format&q=80", // Uluru at sunrise
    day2: "https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8?w=800&h=600&fit=crop&auto=format&q=80", // Red desert landscape
    day3: "https://images.unsplash.com/photo-1608738992986-d88e4cc5b3b9?w=800&h=600&fit=crop&auto=format&q=80", // Aboriginal art cave
    day4: "https://images.unsplash.com/photo-1486022050270-e8b07bc49b81?w=800&h=600&fit=crop&auto=format&q=80", // Outback camp
    day5: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop&auto=format&q=80", // Desert wildlife
    day6: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=600&fit=crop&auto=format&q=80", // Outback stargazing
    day7: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&h=600&fit=crop&auto=format&q=80", // Desert sunset
    fallback: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&auto=format&q=80"
  },
  
  // Norwegian Fjords (ID: 10)
  "norwegian_fjords": {
    day1: "https://images.unsplash.com/photo-1601439678777-b2b3c56fa627?w=800&h=600&fit=crop&auto=format&q=80", // Geirangerfjord panorama
    day2: "https://images.unsplash.com/photo-1578911373434-0cb395d2cbfb?w=800&h=600&fit=crop&auto=format&q=80", // Seven Sisters waterfall
    day3: "https://images.unsplash.com/photo-1568393691622-c7ba131d63b4?w=800&h=600&fit=crop&auto=format&q=80", // Fjord cruise
    day4: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&auto=format&q=80", // Trolltunga hike
    day5: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop&auto=format&q=80", // Preikestolen cliff
    day6: "https://images.unsplash.com/photo-1520637836862-4d197d17c93a?w=800&h=600&fit=crop&auto=format&q=80", // Viking museum
    day7: "https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=800&h=600&fit=crop&auto=format&q=80", // Northern lights
    fallback: "https://images.unsplash.com/photo-1601439678777-b2b3c56fa627?w=800&h=600&fit=crop&auto=format&q=80"
  },
  
  // Serengeti Migration (ID: 21)
  "serengeti_migration": {
    day1: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&h=600&fit=crop&auto=format&q=80", // Serengeti entry gates
    day2: "https://images.unsplash.com/photo-1566555110834-0af5e5cf38c5?w=800&h=600&fit=crop&auto=format&q=80", // Wildebeest migration herds
    day3: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&h=600&fit=crop&auto=format&q=80", // Lions hunting
    day4: "https://images.unsplash.com/photo-1574870111867-089730e5a72b?w=800&h=600&fit=crop&auto=format&q=80", // Mara river crossing
    day5: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=800&h=600&fit=crop&auto=format&q=80", // Maasai cultural village
    day6: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&auto=format&q=80", // Ngorongoro crater with wildlife
    day7: "https://images.unsplash.com/photo-1564149504063-338de52293c6?w=800&h=600&fit=crop&auto=format&q=80", // Conservation research station
    day8: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&h=600&fit=crop&auto=format&q=80", // Final migration sunset
    fallback: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&h=600&fit=crop&auto=format&q=80"
  },
  
  // Generic fallback for unknown destinations
  generic: {
    day1: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop&auto=format&q=80", // Travel wanderlust
    day2: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop&auto=format&q=80", // Adventure landscape
    day3: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop&auto=format&q=80", // Ocean horizon
    day4: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&auto=format&q=80", // Forest path
    day5: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&auto=format&q=80", // Mountain vista
    day6: "https://images.unsplash.com/photo-1464822759844-d150baef493e?w=800&h=600&fit=crop&auto=format&q=80", // Nature escape
    day7: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=600&fit=crop&auto=format&q=80", // Sunset journey
    fallback: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop&auto=format&q=80"
  }
};

interface ItineraryDay {
  day: string;
  title: string;
  description: string;
  activities?: string[];
  highlights?: string[];
  duration?: string;
  location?: string;
}

interface DayByDayItineraryProps {
  destination: {
    id: number;
    name: string;
    country: string;
    imageUrl: string | null;
    itinerary: any[] | unknown;
    description?: string;
    price?: string;
    duration?: number;
  };
  activeDay?: number;
  onDaySelect?: (dayIndex: number) => void;
}

export default function DayByDayItinerary({ 
  destination, 
  activeDay = 1, 
  onDaySelect 
}: DayByDayItineraryProps) {
  
  // Generate day-specific highlights based on destination and day content
  const getHighlightsForDay = (day: ItineraryDay, index: number) => {
    const dayActivities = day?.activities || [];
    const destinationName = destination?.name.toLowerCase() || '';
    const dayNumber = index + 1;
    
    // Use existing activities if available
    if (dayActivities.length > 0) {
      return dayActivities.slice(0, 4);
    }

    // Generate destination-specific highlights
    if (destinationName.includes('tokyo') || destinationName.includes('japan')) {
      const tokyoHighlights = [
        ["Arrival at Narita Airport with private transfer", "Traditional welcome tea ceremony", "Evening exploration of Shibuya district", "Authentic izakaya dining experience"],
        ["Early morning visit to Tsukiji Fish Market", "Sushi preparation masterclass", "Afternoon in Asakusa traditional district", "Tokyo Skytree observation deck access"],
        ["Day trip to Mount Fuji scenic area", "Traditional onsen hot spring experience", "Lake Kawaguchi panoramic views", "Local craft workshop participation"],
        ["Meiji Shrine spiritual morning visit", "Harajuku fashion district exploration", "Traditional kaiseki lunch preparation", "Ginza premium shopping district tour"],
        ["Imperial Palace East Gardens visit", "Calligraphy and ink painting workshop", "Ueno Park museum district exploration", "Final evening at rooftop restaurant"],
        ["Kyoto bullet train journey experience", "Fushimi Inari shrine thousand gates", "Traditional bamboo forest walk", "Geisha district historical tour"],
        ["Golden Pavilion temple visit", "Traditional tea ceremony participation", "Nijo Castle gardens exploration", "Departure arrangements and transfers"]
      ];
      return tokyoHighlights[Math.min(index, tokyoHighlights.length - 1)] || tokyoHighlights[0];
      
    } else if (destinationName.includes('maldives')) {
      const maldivesHighlights = [
        ["Seaplane transfer with aerial island views", "Overwater villa check-in and orientation", "Sunset cocktails on private deck", "Welcome dinner under the stars"],
        ["Morning snorkeling in house reef", "Marine biology guided tour", "Beachfront spa treatment session", "Private beach dinner setup"],
        ["Dolphin watching cruise expedition", "Underwater restaurant dining experience", "Infinity pool relaxation time", "Night fishing traditional experience"],
        ["Full day diving excursion", "Coral reef conservation education", "Beach volleyball and water sports", "Maldivian cultural performance evening"],
        ["Private island picnic excursion", "Sandbank helicopter tour", "Couples massage in overwater spa", "Sunset sailing on traditional dhoni"],
        ["Deep sea fishing adventure", "Cooking class with resort chef", "Kayaking through mangrove channels", "Stargazing session with astronomer"],
        ["Final sunrise yoga session", "Underwater photography workshop", "Farewell reef snorkeling", "Seaplane departure with memories"]
      ];
      return maldivesHighlights[Math.min(index, maldivesHighlights.length - 1)] || maldivesHighlights[0];
      
    } else if (destinationName.includes('himalaya') || destinationName.includes('everest') || destinationName.includes('nepal')) {
      const himalayanHighlights = [
        ["Arrival in Kathmandu with mountain views", "Traditional Nepali welcome ceremony", "Durbar Square UNESCO heritage tour", "Equipment fitting for trekking"],
        ["Scenic flight to Lukla airstrip", "Trek beginning through Sherpa villages", "Suspension bridge crossings", "First mountain lodge accommodation"],
        ["Namche Bazaar acclimatization day", "Sherpa culture museum visit", "Panoramic Everest viewpoint hike", "Traditional yak cheese tasting"],
        ["Trek to Tengboche monastery", "Buddhist prayer ceremony participation", "Ama Dablam mountain photography", "Meditation session with monks"],
        ["Advanced altitude trekking", "Everest Base Camp approach", "High altitude photography workshop", "Sherpa stories around lodge fire"],
        ["Summit attempt preparation", "Sunrise over Himalayan peaks", "Prayer flag ceremony", "Celebration dinner at base camp"],
        ["Helicopter rescue scenic flight", "Mountain rescue demonstration", "Kathmandu valley sightseeing", "Traditional farewell dinner"]
      ];
      return himalayanHighlights[Math.min(index, himalayanHighlights.length - 1)] || himalayanHighlights[0];
    }

    // Default generic highlights
    return [
      "Arrival and check-in experience",
      "Local orientation and welcome",
      "Cultural immersion activities",
      "Authentic dining experience"
    ];
  };

  // Get landmark image for specific day based on destination
  const getLandmarkImageForDay = (destination: any, dayIndex: number) => {
    const destinationName = destination?.name.toLowerCase().replace(/\s+/g, '_') || '';
    const destinationId = destination?.id;
    
    // Create destination key from name
    let destinationKey = 'generic';
    
    // Direct mapping based on destination names and IDs
    if (destinationName.includes('maldives') && destinationName.includes('luxury')) {
      destinationKey = 'maldives_luxury_resort';
    } else if (destinationName.includes('tokyo') || destinationName.includes('adventure')) {
      destinationKey = 'tokyo_adventure';
    } else if (destinationName.includes('himalayan') || destinationName.includes('expedition')) {
      destinationKey = 'himalayan_expedition';
    } else if (destinationName.includes('serengeti') || destinationName.includes('migration')) {
      destinationKey = 'serengeti_migration';
    } else if (destinationName.includes('african') || destinationName.includes('safari')) {
      destinationKey = 'african_safari';
    } else if (destinationName.includes('iceland') || destinationName.includes('adventure')) {
      destinationKey = 'iceland_adventure';
    } else if (destinationName.includes('swiss') || destinationName.includes('alps')) {
      destinationKey = 'swiss_alps';
    } else if (destinationName.includes('barrier') || destinationName.includes('reef')) {
      destinationKey = 'great_barrier_reef';
    } else if (destinationName.includes('australian') || destinationName.includes('outback')) {
      destinationKey = 'australian_outback';
    } else if (destinationName.includes('norwegian') || destinationName.includes('fjords')) {
      destinationKey = 'norwegian_fjords';
    }
    
    // Fallback based on ID if name matching fails
    if (destinationKey === 'generic') {
      switch (destinationId) {
        case 2: destinationKey = 'maldives_luxury_resort'; break;
        case 3: destinationKey = 'tokyo_adventure'; break;
        case 4: destinationKey = 'himalayan_expedition'; break;
        case 5: destinationKey = 'african_safari'; break;
        case 6: destinationKey = 'iceland_adventure'; break;
        case 7: destinationKey = 'swiss_alps'; break;
        case 8: destinationKey = 'great_barrier_reef'; break;
        case 9: destinationKey = 'australian_outback'; break;
        case 10: destinationKey = 'norwegian_fjords'; break;
        case 21: destinationKey = 'serengeti_migration'; break;
        default: destinationKey = 'generic';
      }
    }
    
    // Get the specific day image or fallback
    const dayKey = `day${dayIndex + 1}` as keyof typeof DESTINATION_LANDMARK_IMAGES.generic;
    const imageSet = DESTINATION_LANDMARK_IMAGES[destinationKey as keyof typeof DESTINATION_LANDMARK_IMAGES] || DESTINATION_LANDMARK_IMAGES.generic;
    
    return imageSet[dayKey] || imageSet.fallback;
  };

  // Get appropriate icon for each day
  const getIconForDay = (day: ItineraryDay, index: number) => {
    const dayTitle = day?.title?.toLowerCase() || '';
    const dayNumber = index + 1;
    
    if (dayTitle.includes('arrival') || dayNumber === 1) return MapPin;
    if (dayTitle.includes('mountain') || dayTitle.includes('trek')) return Mountain;
    if (dayTitle.includes('water') || dayTitle.includes('beach') || dayTitle.includes('diving')) return Waves;
    if (dayTitle.includes('culture') || dayTitle.includes('temple')) return Castle;
    if (dayTitle.includes('nature') || dayTitle.includes('forest')) return TreePine;
    if (dayTitle.includes('food') || dayTitle.includes('dining')) return Coffee;
    if (dayTitle.includes('sunset') || dayTitle.includes('sunrise')) return Sun;
    if (dayTitle.includes('fish') || dayTitle.includes('marine')) return Fish;
    if (dayTitle.includes('island') || dayTitle.includes('tropical')) return TreePalm;
    
    return Sparkles; // Default icon
  };

  const itinerary = Array.isArray(destination?.itinerary) ? destination.itinerary : [];
  const imageUrl = destination?.imageUrl || '';

  return (
    <section id="itinerary-section" className="relative py-20 px-6 overflow-hidden">
      {/* Fixed Background with Parallax */}
      <motion.div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      />
      
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.3 }}
          className="text-center mb-16"
        >
          <motion.h2 
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gold-accent to-lavender-accent bg-clip-text text-transparent mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            Your Journey Unfolds
          </motion.h2>
          
          <motion.p 
            className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6"
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            viewport={{ once: true }}
          >
            Experience every moment of your {destination.name} adventure with our carefully crafted day-by-day itinerary
          </motion.p>
          
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            viewport={{ once: true }}
          >
            <PDFExport destination={{
              id: destination.id,
              name: destination.name,
              country: destination.country,
              description: destination.description || `Experience the beauty of ${destination.name}`,
              price: destination.price || '0',
              duration: destination.duration || 7,
              itinerary: Array.isArray(destination.itinerary) ? destination.itinerary : [],
              imageUrl: destination.imageUrl
            }} />
          </motion.div>
        </motion.div>

        {/* Layered Journey Cards */}
        <div className="space-y-24">
          {itinerary.map((day: ItineraryDay, index: number) => {
            const DayIcon = getIconForDay(day, index);
            const highlights = getHighlightsForDay(day, index);
            
            return (
              <motion.div
                key={day.day}
                id={`day-${day.day}`}
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 1, 
                  delay: index * 0.2,
                  ease: "easeOut"
                }}
                viewport={{ once: true, amount: 0.3 }}
                className="max-w-6xl mx-auto"
                onClick={() => onDaySelect?.(index + 1)}
              >
                <Card className={`glass-morphism border-gold-accent/20 overflow-hidden cursor-pointer transition-all duration-300 ${
                  activeDay === index + 1 ? 'ring-2 ring-gold-accent shadow-2xl' : 'hover:shadow-xl'
                }`}>
                  <div className={`grid md:grid-cols-2 gap-0 ${index % 2 === 1 ? 'md:grid-flow-col-dense' : ''}`}>
                    {/* Landmark Image Section */}
                    <motion.div 
                      className={`relative h-96 md:h-auto ${index % 2 === 1 ? 'md:col-start-2' : ''}`}
                      initial={{ opacity: 0, x: index % 2 === 0 ? -150 : 150 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ 
                        duration: 1.2, 
                        delay: 0.3,
                        ease: "easeOut"
                      }}
                      viewport={{ once: true }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <RobustImage
                        src={getLandmarkImageForDay(destination, index)}
                        alt={`${day.title} - Day ${index + 1} Landmark`}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      
                      {/* Day Number Badge */}
                      <motion.div 
                        className="absolute top-6 left-6"
                        initial={{ scale: 0, rotate: -180 }}
                        whileInView={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        viewport={{ once: true }}
                      >
                        <Badge className="bg-gold-accent text-black px-4 py-2 text-lg font-bold rounded-full shadow-lg">
                          {day.day}
                        </Badge>
                      </motion.div>

                      {/* Floating Day Icon */}
                      <motion.div 
                        className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-lg"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        viewport={{ once: true }}
                        whileHover={{ scale: 1.1, rotate: 10 }}
                      >
                        <DayIcon className="w-6 h-6 text-gold-accent" />
                      </motion.div>
                    </motion.div>

                    {/* Content Section */}
                    <motion.div 
                      className={`p-8 md:p-12 flex flex-col justify-center ${index % 2 === 1 ? 'md:col-start-1' : ''}`}
                      initial={{ opacity: 0, x: index % 2 === 0 ? 150 : -150 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ 
                        duration: 1.2, 
                        delay: 0.5,
                        ease: "easeOut"
                      }}
                      viewport={{ once: true }}
                    >
                      {/* Title with Animation */}
                    <motion.h3 
                      className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-gold-accent bg-clip-text text-transparent"
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.7 }}
                      viewport={{ once: true }}
                    >
                      {day.title}
                    </motion.h3>

                    {/* Description */}
                    <motion.p 
                      className="text-lg text-muted-foreground mb-6 leading-relaxed"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.9 }}
                      viewport={{ once: true }}
                    >
                      {day.description}
                    </motion.p>

                    {/* Duration and Location */}
                    <div className="flex items-center gap-4 mb-6">
                      {day.duration && (
                        <motion.div 
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.6, delay: 1.1 }}
                          viewport={{ once: true }}
                        >
                          <Clock className="w-4 h-4" />
                          <span>{day.duration}</span>
                        </motion.div>
                      )}
                      
                      {day.location && (
                        <motion.div 
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.6, delay: 1.2 }}
                          viewport={{ once: true }}
                        >
                          <MapPin className="w-4 h-4" />
                          <span>{day.location}</span>
                        </motion.div>
                      )}
                    </div>

                    {/* Highlights Grid */}
                    <motion.div 
                      className="grid gap-3"
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 1.3 }}
                      viewport={{ once: true }}
                    >
                      {highlights.map((highlight: string, highlightIndex: number) => (
                        <motion.div
                          key={highlightIndex}
                          className="flex items-start gap-3 group"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ 
                            duration: 0.6, 
                            delay: 1.4 + (highlightIndex * 0.1) 
                          }}
                          viewport={{ once: true }}
                        >
                          <motion.div 
                            className="w-2 h-2 bg-gold-accent rounded-full mt-2 flex-shrink-0"
                            whileHover={{ scale: 1.5 }}
                            transition={{ duration: 0.2 }}
                          />
                          <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                            {highlight}
                          </p>
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}