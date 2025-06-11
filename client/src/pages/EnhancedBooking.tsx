import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Calendar,
  Users,
  MapPin,
  Star,
  Clock,
  Plane,
  CreditCard,
  Check,
  ArrowLeft,
  ChevronDown,
  Gift,
  Shield,
  Camera,
  Mountain,
  Waves,
  TreePine,
  Coffee,
  Heart,
  Sparkles,
  Zap,
  Navigation,
  Music,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Crown,
  Compass,
  Anchor,
  Fish,
  Snowflake,
  Wind,
  Castle,
  Sun,
  Grape,
  TreePalm,
  Building,
  Flower2,
  Shell
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format, addDays } from "date-fns";
import { RobustImage } from "@/components/ui/robust-image";

interface Destination {
  id: number;
  name: string;
  country: string;
  description: string;
  imageUrl: string;
  price: string;
  duration: number;
  rating: string;
  reviewCount: number;
  maxGuests: number;
  features: string[];
  itinerary: any[];
}

const travelClasses = [
  { value: "economy", label: "Economy", price: 0 },
  { value: "business", label: "Business", price: 500 }
];

const upgrades = [
  { id: "priority-boarding", name: "Priority Boarding", price: 50, icon: Plane },
  { id: "extra-luggage", name: "Extra Luggage", price: 75, icon: Gift },
  { id: "travel-insurance", name: "Travel Insurance", price: 100, icon: Shield },
  { id: "airport-transfer", name: "Airport Transfer", price: 120, icon: Plane }
];

export default function EnhancedBooking() {
  const [match, params] = useRoute("/booking/:id");
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [travelClass, setTravelClass] = useState("economy");
  const [selectedUpgrades, setSelectedUpgrades] = useState<string[]>([]);
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);
  const [activeItineraryDay, setActiveItineraryDay] = useState(1);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [currentScrollStage, setCurrentScrollStage] = useState(0);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const destinationId = params?.id ? parseInt(params.id) : 0;



  // Fetch destination details
  const { data: destination, isLoading } = useQuery({
    queryKey: ['/api/destinations', destinationId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/destinations/${destinationId}`);
      return response.json();
    },
    enabled: !!destinationId,
  });

  // Check authentication
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to book a trip",
        variant: "destructive",
      });
      navigate("/auth");
    }
  }, [isAuthenticated, authLoading, navigate, toast]);

  // Set default dates
  useEffect(() => {
    const today = new Date();
    const defaultCheckIn = addDays(today, 7);
    const defaultCheckOut = addDays(defaultCheckIn, destination?.duration || 7);
    
    setCheckIn(format(defaultCheckIn, 'yyyy-MM-dd'));
    setCheckOut(format(defaultCheckOut, 'yyyy-MM-dd'));
  }, [destination]);

  // Scroll tracking for parallax effects and stage progression
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrollY(scrollPosition);
      
      // Calculate scroll stages based on viewport height
      const viewportHeight = window.innerHeight;
      const stage = Math.floor(scrollPosition / (viewportHeight * 0.8));
      setCurrentScrollStage(Math.min(stage, 5)); // Max 5 stages
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Journey stages for timeline progression
  const journeyStages = [
    { id: 0, title: "Journey Begins", description: "Welcome to your adventure" },
    { id: 1, title: "Day-by-Day", description: "Explore your itinerary" },
    { id: 2, title: "Highlights", description: "Key experiences await" },
    { id: 3, title: "Information", description: "Everything you need" },
    { id: 4, title: "Booking", description: "Secure your trip" },
    { id: 5, title: "Complete", description: "Adventure awaits" }
  ];

  // Use the real destination itinerary data from the database
  const mockItinerary = destination?.itinerary || [];

  // Generate varied images for each day based on destination and day content
  const getVariedImageForDay = (destination: any, day: any, index: number) => {
    const destinationName = destination?.name.toLowerCase() || '';
    const country = destination?.country?.toLowerCase() || '';

    // Base image collections for different destination types
    const imageCollections = {
      tokyo: [
        "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1528164344705-47542687000d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1554978991-33ef7f31d658?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1522383225653-ed111181a951?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1513407030348-c983a97b98d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
      ],
      maldives: [
        "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1582967788606-a171c1080cb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1571501679680-de32f1e7aad4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
      ],
      safari: [
        "https://images.unsplash.com/photo-1516426122078-c23e76319801?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1547036967-23d11aacaee0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1544735716-392fe2489ffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
      ],
      default: [
        "https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1544735716-392fe2489ffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
      ]
    };

    // Determine which image collection to use
    let selectedCollection = imageCollections.default;
    
    if (destinationName.includes('tokyo') || destinationName.includes('japan')) {
      selectedCollection = imageCollections.tokyo;
    } else if (destinationName.includes('maldives')) {
      selectedCollection = imageCollections.maldives;
    } else if (destinationName.includes('safari') || destinationName.includes('kenya') || country.includes('kenya')) {
      selectedCollection = imageCollections.safari;
    }

    // Return image based on day index, cycling through collection
    return selectedCollection[index % selectedCollection.length];
  };

  // Generate key highlights for each day in dot point format
  const getHighlightsForDay = (day: any, index: number) => {
    const dayActivities = day?.activities || [];
    
    // Extract meaningful highlights from activities or generate based on destination
    if (dayActivities.length > 0) {
      return dayActivities.slice(0, 4).map((activity: any) => 
        typeof activity === 'string' ? activity : activity.name || activity.description || 'Experience included'
      );
    }

    // Generate destination-specific highlights
    const destinationName = destination?.name.toLowerCase() || '';
    
    if (destinationName.includes('tokyo') || destinationName.includes('japan')) {
      return [
        "Traditional temple visits with guided cultural insights",
        "Authentic local cuisine experiences",
        "Cherry blossom viewing in prime locations",
        "Modern Tokyo exploration and shopping districts"
      ];
    } else if (destinationName.includes('maldives')) {
      return [
        "Overwater villa accommodation with ocean views",
        "Snorkeling and diving in coral reefs",
        "Spa treatments and wellness experiences", 
        "Sunset cruise and dolphin watching"
      ];
    } else if (destinationName.includes('safari') || destinationName.includes('kenya')) {
      return [
        "Big Five wildlife viewing opportunities", 
        "Professional safari guide and transportation",
        "Cultural interactions with Maasai communities",
        "Conservation education and park support"
      ];
    }

    // Default highlights for other destinations
    return [
      "Professional local guide services",
      "Premium location access and activities", 
      "Cultural immersion experiences",
      "Transportation and logistics included"
    ];
  };

  // Generate destination-specific interactive hotspots with varied colors
  const getDestinationHotspots = () => {
    const destinationName = destination?.name.toLowerCase() || '';
    
    if (destinationName.includes('kenya') || destinationName.includes('safari')) {
      return [
        {
          id: "spot1",
          x: 25,
          y: 40,
          title: "Lion Pride Territory",
          description: "Witness majestic lions in their natural habitat during game drives.",
          icon: Crown,
          color: "text-amber-500"
        },
        {
          id: "spot2",
          x: 60,
          y: 30,
          title: "Elephant Migration Route",
          description: "Experience the incredible elephant herds on their ancient migration paths.",
          icon: Mountain,
          color: "text-slate-600"
        },
        {
          id: "spot3",
          x: 80,
          y: 60,
          title: "Giraffe Sanctuary",
          description: "Get up close with the tallest animals on Earth in protected reserves.",
          icon: TreePine,
          color: "text-green-600"
        },
        {
          id: "spot4",
          x: 45,
          y: 70,
          title: "Zebra Plains",
          description: "Marvel at thousands of zebras grazing across the endless savanna.",
          icon: Compass,
          color: "text-purple-600"
        }
      ];
    } else if (destinationName.includes('iceland')) {
      return [
        {
          id: "spot1",
          x: 25,
          y: 40,
          title: "Aurora Borealis Zone",
          description: "Witness the magical Northern Lights dancing across the Arctic sky.",
          icon: Sparkles,
          color: "text-green-400"
        },
        {
          id: "spot2",
          x: 60,
          y: 30,
          title: "Geothermal Wonders",
          description: "Relax in natural hot springs heated by the Earth's core energy.",
          icon: Zap,
          color: "text-blue-500"
        },
        {
          id: "spot3",
          x: 80,
          y: 60,
          title: "Glacier Adventures",
          description: "Explore ancient ice formations and crystal-clear ice caves.",
          icon: Snowflake,
          color: "text-cyan-300"
        },
        {
          id: "spot4",
          x: 45,
          y: 70,
          title: "Viking Heritage",
          description: "Discover Iceland's rich Norse history in charming fishing villages.",
          icon: Anchor,
          color: "text-orange-500"
        }
      ];
    } else if (destinationName.includes('santorini') || destinationName.includes('greece')) {
      return [
        {
          id: "spot1",
          x: 25,
          y: 40,
          title: "Caldera Views",
          description: "Marvel at breathtaking views of the volcanic caldera and Aegean Sea.",
          icon: Mountain,
          color: "text-blue-600"
        },
        {
          id: "spot2",
          x: 60,
          y: 30,
          title: "Oia Sunset",
          description: "Experience the world's most famous sunset from clifftop villages.",
          icon: Sun,
          color: "text-orange-400"
        },
        {
          id: "spot3",
          x: 80,
          y: 60,
          title: "Volcanic Wineries",
          description: "Taste unique wines grown in volcanic soil with caldera views.",
          icon: Grape,
          color: "text-purple-500"
        },
        {
          id: "spot4",
          x: 45,
          y: 70,
          title: "Aegean Sailing",
          description: "Sail crystal-clear waters to hidden beaches and sea caves.",
          icon: Anchor,
          color: "text-blue-500"
        }
      ];
    } else if (destinationName.includes('tokyo') || destinationName.includes('japan')) {
      return [
        {
          id: "spot1",
          x: 25,
          y: 40,
          title: "Cherry Blossoms",
          description: "Experience the magical sakura season in traditional gardens.",
          icon: Flower2,
          color: "text-pink-400"
        },
        {
          id: "spot2",
          x: 60,
          y: 30,
          title: "Historic Temples",
          description: "Visit ancient temples and shrines in the heart of modern Tokyo.",
          icon: Building,
          color: "text-red-600"
        },
        {
          id: "spot3",
          x: 80,
          y: 60,
          title: "Tsukiji Market",
          description: "Discover the world's largest fish market and authentic sushi culture.",
          icon: Fish,
          color: "text-blue-600"
        },
        {
          id: "spot4",
          x: 45,
          y: 70,
          title: "Bamboo Forests",
          description: "Walk through mystical bamboo groves in serene temple grounds.",
          icon: TreePine,
          color: "text-green-500"
        }
      ];
    } else if (destinationName.includes('norway') || destinationName.includes('fjord')) {
      return [
        {
          id: "spot1",
          x: 25,
          y: 40,
          title: "Dramatic Fjords",
          description: "Cruise through UNESCO World Heritage fjords with towering cliffs.",
          icon: Mountain,
          color: "text-gray-600"
        },
        {
          id: "spot2",
          x: 60,
          y: 30,
          title: "Whale Watching",
          description: "Spot orcas, humpback whales, and arctic wildlife in their habitat.",
          icon: Waves,
          color: "text-blue-600"
        },
        {
          id: "spot3",
          x: 80,
          y: 60,
          title: "Midnight Sun",
          description: "Experience the phenomenon of 24-hour daylight in summer.",
          icon: Sun,
          color: "text-yellow-400"
        },
        {
          id: "spot4",
          x: 45,
          y: 70,
          title: "Alpine Adventures",
          description: "Enjoy world-class skiing and mountain hiking opportunities.",
          icon: Snowflake,
          color: "text-cyan-300"
        }
      ];
    } else if (destinationName.includes('maldives')) {
      return [
        {
          id: "spot1",
          x: 25,
          y: 40,
          title: "Overwater Villas",
          description: "Stay in luxury overwater bungalows with direct lagoon access.",
          icon: TreePalm,
          color: "text-green-500"
        },
        {
          id: "spot2",
          x: 60,
          y: 30,
          title: "Coral Reefs",
          description: "Snorkel in pristine coral gardens with tropical marine life.",
          icon: Fish,
          color: "text-orange-500"
        },
        {
          id: "spot3",
          x: 80,
          y: 60,
          title: "Crystal Waters",
          description: "Swim in crystal-clear turquoise lagoons with perfect visibility.",
          icon: Waves,
          color: "text-blue-400"
        },
        {
          id: "spot4",
          x: 45,
          y: 70,
          title: "Sunset Cruises",
          description: "Watch breathtaking sunsets from traditional dhoni boats.",
          icon: Sun,
          color: "text-yellow-500"
        }
      ];
    }
    
    // Default hotspots for other destinations
    return [
      {
        id: "spot1",
        x: 25,
        y: 40,
        title: "Cultural Heritage",
        description: "Discover the rich cultural heritage and local traditions.",
        icon: Building,
        color: "text-amber-600"
      },
      {
        id: "spot2",
        x: 60,
        y: 30,
        title: "Natural Wonders",
        description: "Explore breathtaking natural landscapes and scenic views.",
        icon: Mountain,
        color: "text-green-600"
      },
      {
        id: "spot3",
        x: 80,
        y: 60,
        title: "Adventure Activities",
        description: "Experience thrilling adventures and outdoor activities.",
        icon: Zap,
        color: "text-blue-600"
      },
      {
        id: "spot4",
        x: 45,
        y: 70,
        title: "Local Cuisine",
        description: "Savor authentic local flavors and culinary traditions.",
        icon: Coffee,
        color: "text-red-600"
      }
    ];
  };

  const destinationHotspots = getDestinationHotspots();

  // Create booking mutation
  const createBooking = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await apiRequest("POST", "/api/bookings", bookingData);
      return response.json();
    },
    onSuccess: (booking) => {
      toast({
        title: "Booking Created!",
        description: "Redirecting to payment...",
      });
      // Navigate to payment page with the booking ID
      navigate(`/payment/${booking.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Calculate total price
  const calculateTotal = () => {
    const basePrice = parseFloat(destination?.price || "0");
    const classPrice = travelClasses.find(tc => tc.value === travelClass)?.price || 0;
    const upgradesTotal = selectedUpgrades.reduce((total, upgradeId) => {
      const upgrade = upgrades.find(u => u.id === upgradeId);
      return total + (upgrade?.price || 0);
    }, 0);
    
    return (basePrice * guests) + classPrice + upgradesTotal;
  };

  const toggleUpgrade = (upgradeId: string) => {
    setSelectedUpgrades(prev => 
      prev.includes(upgradeId)
        ? prev.filter(id => id !== upgradeId)
        : [...prev, upgradeId]
    );
  };

  const handleDayTabClick = (dayNumber: number) => {
    setActiveItineraryDay(dayNumber);
    
    // Smooth scroll to the corresponding day card
    const dayElement = document.getElementById(`day-${dayNumber}`);
    if (dayElement) {
      dayElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    }
  };

  const handleBookNow = () => {
    if (!checkIn || !checkOut || !user) return;

    const bookingData = {
      destinationId,
      checkIn,
      checkOut,
      guests,
      travelClass,
      upgrades: selectedUpgrades,
      totalAmount: calculateTotal()
    };

    createBooking.mutate(bookingData);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen pt-32 pb-16 px-6 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-gold-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen pt-32 pb-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Destination Not Found</h1>
          <p className="text-muted-foreground mb-8">The destination you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/destinations")}>
            Return to Destinations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section with Parallax Background */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div 
          className="absolute inset-0 z-0"
          style={{
            transform: `translateY(${scrollY * 0.5}px)`,
          }}
        >
          <RobustImage
            src={destination.imageUrl}
            alt={destination.name}
            className="w-full h-full object-cover"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoadError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />
        </motion.div>

        <div className="relative z-10 text-center text-white px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <Badge className="mb-4 text-sm px-4 py-2 bg-gold-accent/20 text-gold-accent border-gold-accent/30">
              {destination.duration} Days Adventure
            </Badge>
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-gold-accent to-white bg-clip-text text-transparent"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.7 }}
          >
            {destination.name}
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed text-white/90"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            {destination.description}
          </motion.p>
          
          <motion.div 
            className="inline-block"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.3, duration: 0.8, type: "spring" }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => document.getElementById('itinerary-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-gradient-to-r from-gold-accent to-lavender-accent hover:from-gold-accent/80 hover:to-lavender-accent/80 text-white font-semibold text-lg px-8 py-4 rounded-full"
              >
                Explore This Adventure
                <motion.div
                  animate={{ y: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ChevronDown className="w-5 h-5 ml-2" />
                </motion.div>
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Progress Indicator */}
        <motion.div 
          className="fixed right-8 top-1/2 transform -translate-y-1/2 z-50"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 2 }}
        >
          <div className="bg-black/20 backdrop-blur-sm rounded-full p-2">
            {journeyStages.map((stage, index) => (
              <motion.div
                key={stage.id}
                className={`w-3 h-3 rounded-full mb-2 transition-all duration-300 ${
                  currentScrollStage >= index ? 'bg-gold-accent' : 'bg-white/30'
                }`}
                whileHover={{ scale: 1.2 }}
                title={stage.title}
              />
            ))}
          </div>
        </motion.div>
      </section>

      {/* Day-by-Day Itinerary with Layered Slide-In */}
      <section id="itinerary-section" className="relative py-20 px-6 overflow-hidden">
        {/* Fixed Background with Parallax */}
        <motion.div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${destination.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        />
        
        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Left-to-right slide-in for title */}
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
            
            {/* Right-to-left slide-in for subtitle */}
            <motion.p 
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true }}
            >
              Experience every moment of your {destination.duration}-day adventure through {destination.country}
            </motion.p>
          </motion.div>

          {/* Day Tabs with Timeline */}
          <div className="space-y-12">
            <div className="flex justify-center">
              <div className="relative flex space-x-1 bg-black/20 rounded-full p-1 backdrop-blur-sm">
                {mockItinerary.map((day: any, index: number) => (
                  <motion.button
                    key={day.day}
                    onClick={() => handleDayTabClick(day.day)}
                    className={`relative px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                      activeItineraryDay === day.day
                        ? 'text-white shadow-lg'
                        : 'text-muted-foreground hover:text-gold-accent hover:bg-white/10'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {activeItineraryDay === day.day && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-gold-accent to-lavender-accent rounded-full"
                        layoutId="activeTab"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">Day {day.day}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Layered Journey Cards - Each Day Slides In Differently */}
            <div className="space-y-24">
              {mockItinerary.map((day: any, index: number) => (
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
                >
                  <Card className="glass-morphism border-gold-accent/20 overflow-hidden">
                    <div className={`grid md:grid-cols-2 gap-0 ${index % 2 === 1 ? 'md:grid-flow-col-dense' : ''}`}>
                      {/* Image slides in from alternating directions */}
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
                          src={getVariedImageForDay(destination, day, index)}
                          alt={day.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
                        
                        {/* Day number overlay */}
                        <motion.div 
                          className="absolute top-6 left-6 w-16 h-16 bg-gradient-to-br from-gold-accent to-lavender-accent rounded-full flex items-center justify-center shadow-lg"
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          transition={{ delay: 0.8, type: "spring" }}
                          viewport={{ once: true }}
                        >
                          <span className="text-white font-bold text-xl">{day.day}</span>
                        </motion.div>
                      </motion.div>

                      {/* Content slides in with staggered animation */}
                      <motion.div 
                        className="p-8 flex flex-col justify-center"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ 
                          duration: 0.8, 
                          delay: 0.5,
                          ease: "easeOut"
                        }}
                        viewport={{ once: true }}
                      >
                        <Badge className="mb-4 w-fit text-xs px-3 py-1 bg-lavender-accent/20 text-lavender-accent border-lavender-accent/30">
                          Day {day.day}
                        </Badge>
                        
                        <motion.h3 
                          className="text-2xl md:text-3xl font-bold mb-4 text-gold-accent"
                          initial={{ opacity: 0, x: -30 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7, duration: 0.6 }}
                          viewport={{ once: true }}
                        >
                          {day.title}
                        </motion.h3>
                        
                        <motion.p 
                          className="text-muted-foreground text-lg leading-relaxed mb-6"
                          initial={{ opacity: 0, x: -30 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.9, duration: 0.6 }}
                          viewport={{ once: true }}
                        >
                          {day.description}
                        </motion.p>

                        {/* Key highlights in dot points */}
                        <motion.div
                          className="space-y-3"
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.1, duration: 0.6 }}
                          viewport={{ once: true }}
                        >
                          <h4 className="text-lg font-semibold text-gold-accent mb-3">Key Highlights:</h4>
                          <div className="grid grid-cols-1 gap-2">
                            {getHighlightsForDay(day, index).map((highlight: string, idx: number) => (
                              <motion.div
                                key={idx}
                                className="flex items-start space-x-3"
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: 1.2 + idx * 0.1, duration: 0.4 }}
                                viewport={{ once: true }}
                              >
                                <div className="w-2 h-2 rounded-full bg-gold-accent mt-2 flex-shrink-0" />
                                <span className="text-muted-foreground">{highlight}</span>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      </motion.div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Features & Booking Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-16">
            {/* Interactive Image with Hotspots */}
            <motion.div 
              className="lg:col-span-3"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="glass-morphism overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-2xl text-gold-accent">Explore Key Highlights</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="relative h-96 overflow-visible pr-8">
                    <RobustImage
                      src={destination.imageUrl}
                      alt={destination.name}
                      className="w-full h-full object-cover rounded-b-lg"
                    />
                    <div className="absolute inset-0 bg-black/20 rounded-b-lg" />
                    
                    {/* Interactive Hotspots */}
                    {destinationHotspots.map((hotspot, index) => {
                      // Adjust positioning to prevent cutoff on the right side
                      const adjustedX = Math.min(hotspot.x, 75); // Cap at 75% to prevent right-side cutoff
                      return (
                        <motion.div
                          key={hotspot.id}
                          className="absolute z-20"
                          style={{ left: `${adjustedX}%`, top: `${hotspot.y}%` }}
                          initial={{ scale: 0, opacity: 0 }}
                          whileInView={{ scale: 1, opacity: 1 }}
                          transition={{ delay: index * 0.2, type: "spring" }}
                          viewport={{ once: true }}
                        >
                          <motion.button
                            className={`w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/50 flex items-center justify-center ${hotspot.color} hover:bg-white/30 transition-all duration-300 shadow-lg`}
                            onClick={() => setActiveHotspot(activeHotspot === hotspot.id ? null : hotspot.id)}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <hotspot.icon className="w-5 h-5" />
                          </motion.button>
                          
                          <AnimatePresence>
                            {activeHotspot === hotspot.id && (
                              <motion.div
                                className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-black/90 backdrop-blur-sm text-white p-4 rounded-lg min-w-52 z-30 shadow-xl"
                                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.8 }}
                                transition={{ type: "spring", stiffness: 200 }}
                              >
                                <h4 className="font-semibold mb-2 text-gold-accent">{hotspot.title}</h4>
                                <p className="text-sm text-gray-200">{hotspot.description}</p>
                                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Booking Form */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="glass-morphism sticky top-32">
                <CardHeader>
                  <CardTitle className="text-2xl text-gold-accent">Book Your Adventure</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gold-accent">
                      ${destination.price}
                    </div>
                    <div className="text-sm text-muted-foreground">per person</div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="check-in">Check In</Label>
                      <Input
                        id="check-in"
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="check-out">Check Out</Label>
                      <Input
                        id="check-out"
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="guests">Guests</Label>
                      <Select value={guests.toString()} onValueChange={(value) => setGuests(parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: destination.maxGuests }, (_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {i + 1} Guest{i > 0 ? 's' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="travel-class">Travel Class</Label>
                      <Select value={travelClass} onValueChange={setTravelClass}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {travelClasses.map((tc) => (
                            <SelectItem key={tc.value} value={tc.value}>
                              {tc.label} {tc.price > 0 && `(+$${tc.price})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label>Upgrades</Label>
                    <div className="space-y-2 mt-2">
                      {upgrades.map((upgrade) => (
                        <div key={upgrade.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={upgrade.id}
                            checked={selectedUpgrades.includes(upgrade.id)}
                            onChange={() => toggleUpgrade(upgrade.id)}
                            className="rounded"
                          />
                          <label htmlFor={upgrade.id} className="text-sm flex-1 cursor-pointer">
                            {upgrade.name} (+${upgrade.price})
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal ({guests} guests)</span>
                      <span>${(parseFloat(destination.price) * guests).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleBookNow}
                    className="w-full bg-gradient-to-r from-gold-accent to-lavender-accent hover:from-gold-accent/80 hover:to-lavender-accent/80"
                    disabled={createBooking.isPending}
                  >
                    {createBooking.isPending ? "Booking..." : "Book Now"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}