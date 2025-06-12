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
                  {/* Content Section */}
                  <motion.div 
                    className="p-8 md:p-12 flex flex-col justify-center relative"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 1.2, 
                      delay: 0.5,
                      ease: "easeOut"
                    }}
                    viewport={{ once: true }}
                  >
                    {/* Day Number Badge and Icon Header */}
                    <div className="flex items-center justify-between mb-6">
                      <motion.div 
                        className="flex items-center gap-4"
                        initial={{ scale: 0, rotate: -180 }}
                        whileInView={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        viewport={{ once: true }}
                      >
                        <Badge className="bg-gold-accent text-black px-4 py-2 text-lg font-bold rounded-full">
                          {day.day}
                        </Badge>
                        
                        <motion.div 
                          className="bg-muted/50 backdrop-blur-sm rounded-full p-3"
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.8, delay: 0.8 }}
                          viewport={{ once: true }}
                          whileHover={{ scale: 1.1, rotate: 10 }}
                        >
                          <DayIcon className="w-6 h-6 text-gold-accent" />
                        </motion.div>
                      </motion.div>
                    </div>

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
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}