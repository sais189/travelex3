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

// ================================================================================================
// MANUALLY CONFIGURABLE IMAGES FOR DAY-BY-DAY ITINERARIES
// ================================================================================================
// 
// INSTRUCTIONS FOR EDITING IMAGES:
// 1. Find the destination type below (japan, maldives, nepal, kenya, iceland, generic)
// 2. Locate the specific day (day1, day2, day3, etc.)
// 3. Replace the URL with your desired image
// 4. Save the file - changes will be reflected immediately
//
// IMAGE REQUIREMENTS:
// - Use high-quality images (minimum 800x600)
// - Ensure images are relevant to the day's activities
// - Recommended format: https://images.unsplash.com/photo-XXXXXX?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80
//
// DESTINATION TYPES SUPPORTED:
// - japan: For destinations containing "japan", "tokyo" in name or country
// - maldives: For destinations containing "maldives" in name or country  
// - nepal: For destinations containing "nepal", "himalaya", "everest" in name or country
// - kenya: For destinations containing "kenya", "safari" in name or country
// - iceland: For destinations containing "iceland" in name or country
// - generic: Default for all other destinations
//
// ================================================================================================

const DESTINATION_IMAGES = {
  japan: {
    day1: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Tokyo skyline
    day2: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Kinkaku-ji temple
    day3: "https://images.unsplash.com/photo-1522637739821-45282d6e14ba?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Cherry blossoms
    day4: "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Bamboo grove
    day5: "https://images.unsplash.com/photo-1570459027562-4a916cc6113f?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Mount Fuji
    day6: "https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Japanese cuisine
    day7: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Sensoji temple
    fallback: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Meiji Shrine
  },
  maldives: {
    day1: "https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Overwater bungalows
    day2: "https://images.unsplash.com/photo-1494278251643-83efc7e71e34?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Crystal lagoon
    day3: "https://images.unsplash.com/photo-1541184121-90a6eb74db33?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Coral reef
    day4: "https://images.unsplash.com/photo-1524743292513-8ad6a045b3a7?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Sunset beach
    day5: "https://images.unsplash.com/photo-1466693115751-f9b5b2c8b6b5?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Seaplane view
    day6: "https://images.unsplash.com/photo-1542259009477-d625272157b7?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Traditional dhoni
    day7: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Beach dinner
    fallback: "https://images.unsplash.com/photo-1463734275205-e8c7d79daab3?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Maldivian culture
  },
  nepal: {
    day1: "https://images.unsplash.com/photo-1605783960019-8bd5a0639a37?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Mount Everest
    day2: "https://images.unsplash.com/photo-1506203469682-3f8b5d4e2e00?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Himalayan range
    day3: "https://images.unsplash.com/photo-1518709268805-4e9042af2ac1?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Sherpa village
    day4: "https://images.unsplash.com/photo-1579420883471-b6de4a5e4a4e?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Prayer flags
    day5: "https://images.unsplash.com/photo-1534870439272-475715ad6266?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Tengboche monastery
    day6: "https://images.unsplash.com/photo-1564575137824-e3c4fc8c6bf7?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Suspension bridge
    day7: "https://images.unsplash.com/photo-1542652184-fe00ee5b7337?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Kathmandu heritage
    fallback: "https://images.unsplash.com/photo-1566555102687-b33de5f73e56?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Traditional dal bhat
  },
  kenya: {
    day1: "https://images.unsplash.com/photo-1549366021-9f761d040a94?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Lion pride
    day2: "https://images.unsplash.com/photo-1539640705205-b6f86e3c4321?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Elephant migration
    day3: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Zebra herds
    day4: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Giraffe
    day5: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Hot air balloon
    day6: "https://images.unsplash.com/photo-1551971963-66b7b3e7b8d3?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Masai culture
    day7: "https://images.unsplash.com/photo-1602030127743-52a734b56ead?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Safari vehicle
    fallback: "https://images.unsplash.com/photo-1612436079767-5f9c924eb7aa?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Masai village
  },
  iceland: {
    day1: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Aurora Borealis
    day2: "https://images.unsplash.com/photo-1570372444682-1a34b88de3d8?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Gullfoss waterfall
    day3: "https://images.unsplash.com/photo-1473774514473-0b48ac6fdf60?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Geysir eruption
    day4: "https://images.unsplash.com/photo-1460518451285-97b6aa326961?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Blue Lagoon
    day5: "https://images.unsplash.com/photo-1553788194-28d9b01fc540?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Diamond Beach
    day6: "https://images.unsplash.com/photo-1516715094483-75da06b80015?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Black sand beach
    day7: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Glacier lagoon
    fallback: "https://images.unsplash.com/photo-1531835207847-b1b5d8f61ee3?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Volcanic highlands
  },
  generic: {
    day1: "https://unsplash.com/photos/green-fields-and-mountains-under-a-pale-sky-DPfSY8MOIUg w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Mountain landscape
    day2: "https://unsplash.com/photos/low-angle-photo-of-coconut-trees-beside-body-of-water-ueBIGLmiI5A w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Beach sunset
    day3: "https://unsplash.com/photos/a-tall-building-with-a-curved-roof-next-to-other-tall-buildings-lUPL-4C8DLk w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // City architecture
    day4: "https://unsplash.com/photos/pathway-between-trees-during-daytime-PAxyBxTCCz4 w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Forest path
    day5: "https://unsplash.com/photos/a-large-wave-is-breaking-in-the-ocean-JOvEHA9PJMs w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Ocean waves
    day6: "https://unsplash.com/photos/landscape-photography-of-sand-dunes-DV1mP1-H9GU w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Desert landscape
    day7: "https://unsplash.com/photos/a-market-with-lots-of-items-YjjxIieZTkU w=800&h=600&fit=crop&crop=entropy&auto=format&q=80", // Local market
    fallback: "https://unsplash.com/photos/a-boat-is-in-a-large-body-of-water-ciYOQZ7eKQ4", // Travel scene
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

  // Get image for specific day - easily manually configurable
  const getImageForDay = (destination: any, dayIndex: number) => {
    const destinationName = destination?.name.toLowerCase() || '';
    const country = destination?.country?.toLowerCase() || '';
    
    // Determine destination type
    let destinationType = 'generic';
    
    if (destinationName.includes('tokyo') || destinationName.includes('japan') || country.includes('japan')) {
      destinationType = 'japan';
    } else if (destinationName.includes('maldives') || country.includes('maldives')) {
      destinationType = 'maldives';
    } else if (destinationName.includes('kenya') || destinationName.includes('safari') || country.includes('kenya')) {
      destinationType = 'kenya';
    } else if (destinationName.includes('nepal') || destinationName.includes('himalaya') || destinationName.includes('everest') || country.includes('nepal')) {
      destinationType = 'nepal';
    } else if (destinationName.includes('iceland') || country.includes('iceland')) {
      destinationType = 'iceland';
    }
    
    // Get the specific day image or fallback
    const dayKey = `day${dayIndex + 1}` as keyof typeof DESTINATION_IMAGES.generic;
    const imageSet = DESTINATION_IMAGES[destinationType as keyof typeof DESTINATION_IMAGES];
    
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
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            viewport={{ once: true }}
          >
            Experience every moment of your {destination.name} adventure with our carefully crafted day-by-day itinerary
          </motion.p>
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
                    {/* Image Section */}
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
                      whileHover={{ scale: 1.05 }}
                    >
                      <RobustImage
                        src={getImageForDay(destination, index)}
                        alt={`${day.title} - Day ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      {/* Day Number Badge */}
                      <motion.div 
                        className="absolute top-6 left-6"
                        initial={{ scale: 0, rotate: -180 }}
                        whileInView={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        viewport={{ once: true }}
                      >
                        <Badge className="bg-gold-accent text-black px-4 py-2 text-lg font-bold rounded-full">
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