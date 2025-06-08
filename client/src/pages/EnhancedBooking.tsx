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
  Pause
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

  // Mock destination data with interactive features and varied images
  const getItineraryData = () => {
    const destinationName = destination?.name.toLowerCase() || '';
    
    if (destinationName.includes('iceland')) {
      return [
        {
          day: 1,
          title: "Arrival & Reykjavik Discovery",
          description: "Welcome to Iceland! Begin with colorful Reykjavik streets and traditional Icelandic culture.",
          imageUrl: "https://images.unsplash.com/photo-1539704892725-de45bc5b63c9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
          activities: ["Airport transfer", "Reykjavik walking tour", "Traditional dinner"]
        },
        {
          day: 2,
          title: "Northern Lights Hunting",
          description: "Chase the mystical Aurora Borealis across Iceland's pristine wilderness.",
          imageUrl: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
          activities: ["Aurora photography workshop", "Hot springs visit", "Night sky expedition"]
        },
        {
          day: 3,
          title: "Glacier & Geothermal Wonders",
          description: "Explore ancient glaciers and powerful geysers in Iceland's dramatic landscape.",
          imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
          activities: ["Glacier hiking", "Geysir eruption viewing", "Blue Lagoon relaxation"]
        }
      ];
    } else if (destinationName.includes('santorini')) {
      return [
        {
          day: 1,
          title: "Arrival & Oia Village",
          description: "Discover the iconic blue domes and whitewashed buildings of magical Santorini.",
          imageUrl: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
          activities: ["Village exploration", "Sunset viewing", "Traditional taverna dinner"]
        },
        {
          day: 2,
          title: "Volcanic Wine Tour",
          description: "Taste exceptional wines grown in volcanic soil with stunning caldera views.",
          imageUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
          activities: ["Winery visits", "Volcanic landscape tour", "Local cheese tasting"]
        },
        {
          day: 3,
          title: "Aegean Sea Adventure",
          description: "Sail the crystal-clear waters and discover hidden beaches and sea caves.",
          imageUrl: "https://images.unsplash.com/photo-1544970850-7ad5ac882d5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
          activities: ["Catamaran sailing", "Snorkeling excursion", "Beach relaxation"]
        }
      ];
    } else if (destinationName.includes('tokyo') || destinationName.includes('japan')) {
      return [
        {
          day: 1,
          title: "Cherry Blossom Discovery",
          description: "Immerse yourself in Japan's most beautiful season with blooming sakura trees.",
          imageUrl: "https://images.unsplash.com/photo-1522383225653-ed111181a951?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
          activities: ["Hanami picnic", "Temple visits", "Traditional tea ceremony"]
        },
        {
          day: 2,
          title: "Modern Tokyo Experience",
          description: "Explore the vibrant energy of contemporary Tokyo's districts and technology.",
          imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
          activities: ["Shibuya crossing", "Technology museums", "Ramen tasting tour"]
        },
        {
          day: 3,
          title: "Cultural Heritage Journey",
          description: "Connect with Japan's rich history through ancient traditions and crafts.",
          imageUrl: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
          activities: ["Pottery workshop", "Kimono experience", "Garden meditation"]
        }
      ];
    } else if (destinationName.includes('norway') || destinationName.includes('fjord')) {
      return [
        {
          day: 1,
          title: "Fjord Arrival & Bergen",
          description: "Begin your Norwegian adventure in the colorful wooden houses of historic Bergen.",
          imageUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
          activities: ["Bergen fish market", "Funicular railway", "Historic district walk"]
        },
        {
          day: 2,
          title: "Geirangerfjord Cruise",
          description: "Sail through UNESCO World Heritage fjords with cascading waterfalls.",
          imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
          activities: ["Fjord cruise", "Waterfall viewing", "Mountain hiking"]
        },
        {
          day: 3,
          title: "Arctic Wildlife & Midnight Sun",
          description: "Experience the unique Arctic ecosystem and endless daylight phenomenon.",
          imageUrl: "https://images.unsplash.com/photo-1516822003754-d86e59f32c8e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
          activities: ["Wildlife spotting", "Midnight sun photography", "Sami culture experience"]
        }
      ];
    } else {
      // Default varied images for any other destination
      return [
        {
          day: 1,
          title: "Arrival & City Exploration",
          description: "Welcome to your adventure! Start with a guided city tour and cultural immersion.",
          imageUrl: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
          activities: ["Airport transfer", "Welcome dinner", "City orientation walk"]
        },
        {
          day: 2,
          title: "Main Attraction Experience",
          description: "Discover the highlight attractions that make this destination unique.",
          imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
          activities: ["Guided tour", "Photography session", "Local cuisine tasting"]
        },
        {
          day: 3,
          title: "Adventure & Activities",
          description: "Engage in thrilling activities and create unforgettable memories.",
          imageUrl: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
          activities: ["Adventure sports", "Nature exploration", "Cultural workshops"]
        }
      ];
    }
  };

  const mockItinerary = getItineraryData();

  // Generate destination-specific interactive hotspots
  const getDestinationHotspots = () => {
    const destinationName = destination?.name.toLowerCase() || '';
    
    if (destinationName.includes('kenya') || destinationName.includes('safari')) {
      return [
        {
          id: "spot1",
          x: 25,
          y: 40,
          title: "Lion Pride Territory",
          description: "Witness majestic lions in their natural habitat during game drives."
        },
        {
          id: "spot2",
          x: 60,
          y: 30,
          title: "Elephant Migration Route",
          description: "Experience the incredible elephant herds on their ancient migration paths."
        },
        {
          id: "spot3",
          x: 80,
          y: 60,
          title: "Giraffe Sanctuary",
          description: "Get up close with the tallest animals on Earth in protected reserves."
        },
        {
          id: "spot4",
          x: 45,
          y: 70,
          title: "Zebra Plains",
          description: "Marvel at thousands of zebras grazing across the endless savanna."
        }
      ];
    } else if (destinationName.includes('iceland')) {
      return [
        {
          id: "spot1",
          x: 25,
          y: 40,
          title: "Northern Lights",
          description: "Witness the magical Aurora Borealis dancing across the arctic sky."
        },
        {
          id: "spot2",
          x: 60,
          y: 30,
          title: "Active Geysers",
          description: "Watch powerful geothermal eruptions shooting hot water skyward."
        },
        {
          id: "spot3",
          x: 80,
          y: 60,
          title: "Glacier Caves",
          description: "Explore stunning blue ice formations in ancient glacier caves."
        },
        {
          id: "spot4",
          x: 45,
          y: 70,
          title: "Hot Springs",
          description: "Relax in natural geothermal pools surrounded by dramatic landscapes."
        }
      ];
    } else if (destinationName.includes('santorini') || destinationName.includes('greece')) {
      return [
        {
          id: "spot1",
          x: 25,
          y: 40,
          title: "Ancient Ruins",
          description: "Discover 3,000-year-old archaeological sites with stunning views."
        },
        {
          id: "spot2",
          x: 60,
          y: 30,
          title: "Oia Sunset",
          description: "Experience the world's most famous sunset from clifftop villages."
        },
        {
          id: "spot3",
          x: 80,
          y: 60,
          title: "Volcanic Wineries",
          description: "Taste unique wines grown in volcanic soil with caldera views."
        },
        {
          id: "spot4",
          x: 45,
          y: 70,
          title: "Aegean Sailing",
          description: "Sail crystal-clear waters to hidden beaches and sea caves."
        }
      ];
    } else if (destinationName.includes('tokyo') || destinationName.includes('japan')) {
      return [
        {
          id: "spot1",
          x: 25,
          y: 40,
          title: "Cherry Blossoms",
          description: "Experience the magical sakura season in traditional gardens."
        },
        {
          id: "spot2",
          x: 60,
          y: 30,
          title: "Historic Temples",
          description: "Visit ancient temples and shrines in the heart of modern Tokyo."
        },
        {
          id: "spot3",
          x: 80,
          y: 60,
          title: "Tsukiji Market",
          description: "Discover the world's largest fish market and authentic sushi culture."
        },
        {
          id: "spot4",
          x: 45,
          y: 70,
          title: "Bamboo Forests",
          description: "Walk through mystical bamboo groves in serene temple grounds."
        }
      ];
    } else if (destinationName.includes('norway') || destinationName.includes('fjord')) {
      return [
        {
          id: "spot1",
          x: 25,
          y: 40,
          title: "Dramatic Fjords",
          description: "Cruise through UNESCO World Heritage fjords with towering cliffs."
        },
        {
          id: "spot2",
          x: 60,
          y: 30,
          title: "Whale Watching",
          description: "Spot orcas, humpback whales, and arctic wildlife in their habitat."
        },
        {
          id: "spot3",
          x: 80,
          y: 60,
          title: "Midnight Sun",
          description: "Experience the phenomenon of 24-hour daylight in summer."
        },
        {
          id: "spot4",
          x: 45,
          y: 70,
          title: "Alpine Adventures",
          description: "Enjoy world-class skiing and mountain hiking opportunities."
        }
      ];
    } else if (destinationName.includes('croatia') || destinationName.includes('island')) {
      return [
        {
          id: "spot1",
          x: 25,
          y: 40,
          title: "Pristine Beaches",
          description: "Relax on crystal-clear beaches with turquoise Adriatic waters."
        },
        {
          id: "spot2",
          x: 60,
          y: 30,
          title: "Island Hopping",
          description: "Sail between over 1,000 islands each with unique character."
        },
        {
          id: "spot3",
          x: 80,
          y: 60,
          title: "Medieval Towns",
          description: "Explore UNESCO-protected old towns with ancient stone walls."
        },
        {
          id: "spot4",
          x: 45,
          y: 70,
          title: "Underwater Caves",
          description: "Dive in the clearest waters to discover hidden underwater worlds."
        }
      ];
    } else {
      // Default varied hotspots for other destinations
      return [
        {
          id: "spot1",
          x: 25,
          y: 40,
          title: "Scenic Viewpoint",
          description: "Breathtaking panoramic views of the surrounding landscape."
        },
        {
          id: "spot2",
          x: 60,
          y: 30,
          title: "Natural Wonder",
          description: "Discover the natural beauty that makes this destination special."
        },
        {
          id: "spot3",
          x: 80,
          y: 60,
          title: "Cultural Experience",
          description: "Immerse yourself in local traditions and authentic culture."
        },
        {
          id: "spot4",
          x: 45,
          y: 70,
          title: "Photo Opportunity",
          description: "Capture unforgettable moments at this iconic location."
        }
      ];
    }
  };

  const mockHotspots = getDestinationHotspots();

  const expandableSections = [
    {
      id: "included",
      title: "What's Included",
      icon: Check,
      content: [
        "All accommodation (4-5 star hotels)",
        "Daily breakfast and selected meals",
        "Professional local guide",
        "Transportation during the tour",
        "Entrance fees to attractions",
        "Travel insurance coverage"
      ]
    },
    {
      id: "packing",
      title: "Packing Tips",
      icon: Gift,
      content: [
        "Comfortable walking shoes",
        "Weather-appropriate clothing",
        "Camera and extra batteries",
        "Sunscreen and sunglasses",
        "Personal medications",
        "Power bank and adapters"
      ]
    },
    {
      id: "requirements",
      title: "Travel Requirements",
      icon: Shield,
      content: [
        "Valid passport (6+ months remaining)",
        "Travel visa (if required)",
        "COVID-19 vaccination certificate",
        "Travel insurance documentation",
        "Emergency contact information",
        "Copy of booking confirmation"
      ]
    }
  ];

  // Calculate total price
  const calculateTotal = () => {
    if (!destination) return 0;
    
    const basePrice = parseFloat(destination.price) * guests;
    const classUpgrade = travelClasses.find(tc => tc.value === travelClass)?.price || 0;
    const upgradesTotal = selectedUpgrades.reduce((total, upgradeId) => {
      const upgrade = upgrades.find(u => u.id === upgradeId);
      return total + (upgrade?.price || 0);
    }, 0);
    
    return basePrice + (classUpgrade * guests) + upgradesTotal;
  };

  // Create booking mutation
  const createBooking = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await apiRequest("POST", "/api/bookings", bookingData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Booking Created!",
        description: "Redirecting to secure payment...",
      });
      // Redirect to payment page
      navigate(`/payment/${data.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create booking",
        variant: "destructive",
      });
    },
  });

  const handleUpgradeToggle = (upgradeId: string) => {
    setSelectedUpgrades(prev => 
      prev.includes(upgradeId) 
        ? prev.filter(id => id !== upgradeId)
        : [...prev, upgradeId]
    );
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
    <div className="min-h-screen bg-gradient-to-br from-space-blue via-deep-purple to-cosmic-black relative">
      {/* Timeline Progress Indicator */}
      <motion.div 
        className="fixed left-6 top-1/2 transform -translate-y-1/2 z-40 hidden lg:block"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: scrollY > 100 ? 1 : 0, x: scrollY > 100 ? 0 : -50 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-80 bg-gradient-to-b from-gold-accent/30 via-gold-accent/60 to-gold-accent/30"></div>
          
          {/* Progress Dots */}
          <div className="space-y-16">
            {journeyStages.map((stage, index) => (
              <motion.div
                key={stage.id}
                className="relative flex items-center"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: currentScrollStage >= index ? 1 : 0.6,
                  opacity: currentScrollStage >= index ? 1 : 0.4
                }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <motion.div
                  className={`w-4 h-4 rounded-full border-2 ${
                    currentScrollStage >= index 
                      ? 'bg-gold-accent border-gold-accent' 
                      : 'bg-transparent border-gold-accent/40'
                  } relative z-10`}
                  animate={currentScrollStage === index ? {
                    boxShadow: [
                      "0 0 0 0 rgba(255, 215, 0, 0.7)",
                      "0 0 0 10px rgba(255, 215, 0, 0)",
                      "0 0 0 0 rgba(255, 215, 0, 0)"
                    ]
                  } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                
                {/* Stage Info Tooltip */}
                <AnimatePresence>
                  {currentScrollStage === index && (
                    <motion.div
                      initial={{ opacity: 0, x: -20, scale: 0.8 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -20, scale: 0.8 }}
                      className="absolute left-8 bg-black/80 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap"
                    >
                      <div className="font-semibold">{stage.title}</div>
                      <div className="text-xs text-gold-accent">{stage.description}</div>
                      
                      {/* Arrow */}
                      <div className="absolute left-0 top-1/2 transform -translate-x-full -translate-y-1/2">
                        <div className="w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-black/80"></div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
      {/* Cinematic Hero Section with Parallax */}
      <section className="relative h-screen overflow-hidden">
        {/* Parallax Background */}
        <motion.div 
          className="absolute inset-0"
          style={{
            transform: `translateY(${scrollY * 0.5}px)`
          }}
        >
          <RobustImage
            src={destination?.imageUrl || ""}
            alt={destination?.name || "Destination"}
            className="w-full h-[120%]"
            fallbackSrc="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          
          {/* Destination-specific animated elements */}
          {destination.name.toLowerCase().includes('iceland') && (
            <div className="absolute inset-0">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-blue-500/20 to-purple-600/20"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{ backgroundSize: "200% 200%" }}
              />
            </div>
          )}
        </motion.div>

        {/* Hero Content with Staggered Animations */}
        <div className="relative z-10 flex items-center justify-center h-full px-6">
          <div className="text-center text-white max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="mb-6"
            >
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                <Button 
                  variant="ghost" 
                  onClick={() => navigate("/destinations")}
                  className="mb-8 text-white/80 hover:text-white border border-white/20 hover:border-white/40 group"
                >
                  <motion.div
                    whileHover={{ x: -5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                  </motion.div>
                  Back to Destinations
                </Button>
              </motion.div>
              
              <motion.h1 
                className="text-6xl md:text-8xl font-bold mb-4 leading-tight text-white"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 1 }}
              >
                {destination.name}
              </motion.h1>
              
              <motion.div 
                className="flex items-center justify-center space-x-6 mb-6"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <motion.div 
                  className="flex items-center bg-black/30 rounded-full px-4 py-2 backdrop-blur-sm"
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(0,0,0,0.5)" }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Star className="w-5 h-5 text-gold-accent fill-current mr-2" />
                  <span className="text-xl font-semibold">★ {destination.rating}</span>
                </motion.div>
                <motion.div 
                  className="flex items-center bg-black/30 rounded-full px-4 py-2 backdrop-blur-sm"
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(0,0,0,0.5)" }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <MapPin className="w-5 h-5 text-lavender-accent mr-2" />
                  <span className="text-xl">{destination.country}</span>
                </motion.div>
              </motion.div>

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
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-8 h-8 text-white/60" />
        </motion.div>

        {/* Ambient Audio Control */}
        <motion.div
          className="absolute top-32 right-6 z-20"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 2 }}
        >
          <motion.button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="bg-black/30 backdrop-blur-sm rounded-full p-3 text-white/80 hover:text-white hover:bg-black/50 transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </motion.button>
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
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              Explore each day of your adventure through an immersive timeline
            </motion.p>
          </motion.div>

          {/* Day Tabs with Timeline */}
          <div className="space-y-12">
            <div className="flex justify-center">
              <div className="relative flex space-x-1 bg-black/20 rounded-full p-1 backdrop-blur-sm">
                {mockItinerary.map((day, index) => (
                  <motion.button
                    key={day.day}
                    onClick={() => setActiveItineraryDay(day.day)}
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
              {mockItinerary.map((day, index) => (
                <motion.div
                  key={day.day}
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
                          src={day.imageUrl}
                          alt={day.title}
                          className="w-full h-full"
                          fallbackSrc="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                        
                        {/* Floating day badge */}
                        <motion.div 
                          className="absolute top-6 left-6 text-white"
                          initial={{ opacity: 0, scale: 0 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 1, type: "spring", bounce: 0.5 }}
                          viewport={{ once: true }}
                        >
                          <div className="bg-gold-accent/90 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-bold">
                            Day {day.day}
                          </div>
                        </motion.div>
                      </motion.div>

                      {/* Text content slides in from opposite direction */}
                      <motion.div 
                        className={`p-8 flex flex-col justify-center ${index % 2 === 1 ? 'md:col-start-1' : ''}`}
                        initial={{ opacity: 0, x: index % 2 === 0 ? 150 : -150 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ 
                          duration: 1.2, 
                          delay: 0.5,
                          ease: "easeOut"
                        }}
                        viewport={{ once: true }}
                      >
                        <motion.h3
                          className="text-3xl md:text-4xl font-bold mb-4 text-gold-accent"
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.8, duration: 0.8 }}
                          viewport={{ once: true }}
                        >
                          {day.title}
                        </motion.h3>
                        
                        <motion.p
                          className="text-muted-foreground text-lg leading-relaxed mb-8"
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1, duration: 0.8 }}
                          viewport={{ once: true }}
                        >
                          {day.description}
                        </motion.p>
                        
                        {/* Activities fade up sequentially */}
                        <motion.div
                          className="space-y-4"
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          transition={{ delay: 1.2 }}
                          viewport={{ once: true }}
                        >
                          <h4 className="font-semibold text-lavender-accent text-lg mb-4">Today's Adventures:</h4>
                          {day.activities.map((activity, idx) => (
                            <motion.div
                              key={idx}
                              className="flex items-center text-base"
                              initial={{ opacity: 0, x: -30 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              transition={{ 
                                delay: 1.4 + idx * 0.15,
                                duration: 0.6,
                                ease: "easeOut"
                              }}
                              viewport={{ once: true }}
                              whileHover={{ x: 10, scale: 1.02 }}
                            >
                              <motion.div 
                                className="w-3 h-3 bg-gradient-to-r from-gold-accent to-lavender-accent rounded-full mr-4 flex-shrink-0"
                                whileHover={{ scale: 1.3 }}
                                transition={{ type: "spring", stiffness: 400 }}
                              />
                              <span>{activity}</span>
                            </motion.div>
                          ))}
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
      {/* Interactive Hotspot Map with Split Scroll Reveal */}
      <section className="py-20 px-6 relative overflow-visible">
        {/* Fixed background layer */}
        <motion.div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url(${destination.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        />
        
        <div className="relative z-10 max-w-6xl mx-auto px-8 py-8">
          {/* Split layout - Left: Title slides from left, Right: Description from right */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              viewport={{ once: true, amount: 0.3 }}
            >
              <motion.h2 
                className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-gold-accent to-lavender-accent bg-clip-text text-transparent mb-6 text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
              >
                Explore the unique features
              </motion.h2>
            </motion.div>
          </div>

          <motion.div 
            className="relative rounded-2xl overflow-visible shadow-2xl"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="relative h-[600px] w-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-2xl overflow-hidden">
              <RobustImage
                src={destination?.imageUrl || ""}
                alt={destination?.name || "Destination"}
                className="w-full h-full"
                fallbackSrc="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
              
              {/* Interactive Hotspots */}
              {mockHotspots.map((hotspot, index) => (
                <motion.div
                  key={hotspot.id}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.3, duration: 0.6, type: "spring" }}
                  viewport={{ once: true }}
                  className="absolute cursor-pointer group"
                  style={{
                    left: `${hotspot.x}%`,
                    top: `${hotspot.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  onMouseEnter={() => setActiveHotspot(hotspot.id)}
                  onMouseLeave={() => setActiveHotspot(null)}
                >
                  <motion.div
                    className="relative"
                    animate={{
                      scale: activeHotspot === hotspot.id ? 1.2 : 1,
                      y: [0, -10, 0]
                    }}
                    transition={{
                      scale: { duration: 0.3 },
                      y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }}
                  >
                    {/* Pulsing Ring */}
                    <motion.div
                      className="absolute inset-0 rounded-full bg-gold-accent/30"
                      animate={{
                        scale: [1, 1.8, 1],
                        opacity: [0.5, 0, 0.5]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    
                    <motion.div 
                      className="relative w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border-2 border-gold-accent/50 group-hover:border-gold-accent transition-colors duration-300"
                      whileHover={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <MapPin className="w-6 h-6 text-gold-accent" />
                    </motion.div>
                  </motion.div>

                  {/* Smart Tooltip with Dynamic Positioning */}
                  <AnimatePresence>
                    {activeHotspot === hotspot.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                        className={`absolute z-50 ${
                          // Dynamic positioning based on hotspot location
                          hotspot.y < 30 
                            ? 'top-20' // Show below if hotspot is near top
                            : hotspot.y > 70 
                            ? 'bottom-20' // Show above if hotspot is near bottom
                            : 'top-20' // Default to below
                        } ${
                          hotspot.x < 30 
                            ? 'left-0' // Align left if hotspot is near left edge
                            : hotspot.x > 70 
                            ? 'right-0' // Align right if hotspot is near right edge
                            : 'left-1/2 transform -translate-x-1/2' // Center if in middle
                        }`}
                        style={{
                          // Ensure tooltip stays within viewport bounds
                          maxWidth: '280px',
                          minWidth: '220px',
                          // Prevent tooltip from going off-screen
                          left: hotspot.x > 80 ? 'auto' : undefined,
                          right: hotspot.x > 80 ? '0' : undefined,
                          transform: hotspot.x > 30 && hotspot.x < 70 ? 'translateX(-50%)' : undefined
                        }}
                      >
                        <div className="bg-white backdrop-blur-md rounded-xl p-5 shadow-2xl border border-gold-accent/30 relative">
                          <div className="text-center">
                            <h3 className="font-bold text-lg text-gray-900 mb-3 leading-tight">
                              {hotspot.title}
                            </h3>
                            <p className="text-sm text-gray-800 leading-relaxed line-clamp-3">
                              {hotspot.description}
                            </p>
                          </div>
                          
                          {/* Dynamic Arrow Positioning */}
                          <div className={`absolute w-4 h-4 bg-white rotate-45 border ${
                            hotspot.y < 30 
                              ? '-top-2 border-l border-t' // Arrow pointing up
                              : hotspot.y > 70 
                              ? '-bottom-2 border-r border-b' // Arrow pointing down
                              : '-top-2 border-l border-t' // Default arrow pointing up
                          } border-gold-accent/30 ${
                            hotspot.x < 30 
                              ? 'left-6' // Arrow on left side
                              : hotspot.x > 70 
                              ? 'right-6' // Arrow on right side
                              : 'left-1/2 transform -translate-x-1/2' // Centered arrow
                          }`}></div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}

              {/* Instruction Text */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                viewport={{ once: true }}
                className="absolute bottom-6 left-6 text-white/80 text-sm backdrop-blur-sm bg-black/20 rounded-full px-4 py-2"
              >
                Hover over the icons to explore highlights
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
      {/* Expandable Information with Vertical Slide-Up */}
      <section className="py-20 px-6 relative overflow-hidden">
        {/* Subtle moving background */}
        <motion.div 
          className="absolute inset-0 opacity-10"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,215,0,0.1) 2px, transparent 2px)`,
            backgroundSize: '50px 50px'
          }}
        />
        
        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Title slides up from bottom */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
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
              Trip Information
            </motion.h2>
            
            <motion.p 
              className="text-2xl font-bold text-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true }}
            >
              Everything you need to know for your perfect adventure
            </motion.p>
          </motion.div>

          <div className="space-y-4">
            {expandableSections.map((section, index) => {
              const Icon = section.icon;
              const isExpanded = expandedSection === section.id;
              
              return (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <Card className="glass-morphism border-gold-accent/20 overflow-hidden">
                    <motion.button
                      onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                      className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-center space-x-4">
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                          className="p-2 bg-gold-accent/20 rounded-full"
                        >
                          <Icon className="w-5 h-5 text-gold-accent" />
                        </motion.div>
                        <h3 className="text-xl font-semibold">{section.title}</h3>
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      </motion.div>
                    </motion.button>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6 pt-0">
                            <div className="space-y-3">
                              {section.content.map((item, idx) => (
                                <motion.div
                                  key={idx}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.1 }}
                                  className="flex items-center text-muted-foreground"
                                >
                                  <div className="w-2 h-2 bg-lavender-accent rounded-full mr-3 flex-shrink-0" />
                                  <span>{item}</span>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
      {/* Enhanced Booking Section with Blur Transitions */}
      <section id="booking-form" className="py-20 px-6 relative">
        <motion.div 
          className="max-w-6xl mx-auto text-[20px]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gold-accent to-lavender-accent bg-clip-text text-transparent mb-4">
              Complete Your Booking
            </h2>
            <p className="text-2xl font-bold text-foreground max-w-2xl mx-auto">
              Secure your adventure with our seamless booking experience
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Trip Summary with Hover Effects */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <motion.div
                whileHover={{ scale: 1.02, rotateY: 2 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="glass-morphism border-gold-accent/20 mb-8 overflow-hidden">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <MapPin className="w-5 h-5 text-gold-accent" />
                      </motion.div>
                      <span>Trip Summary</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <motion.div 
                      className="relative rounded-xl overflow-hidden"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    >
                      <img
                        src={destination.imageUrl}
                        alt={destination.name}
                        className="w-full h-48 object-cover"
                      />
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
                        whileHover={{ opacity: 0.8 }}
                      />
                      <motion.div 
                        className="absolute bottom-4 left-4 text-white"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <h3 className="text-xl font-bold">{destination.name}</h3>
                        <p className="text-sm opacity-90">{destination.country}</p>
                      </motion.div>
                    </motion.div>
                    
                    <motion.div 
                      className="grid grid-cols-2 gap-4 text-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7, staggerChildren: 0.1 }}
                    >
                      {[
                        { icon: Clock, text: `${destination.duration} days`, color: "text-lavender-accent" },
                        { icon: Star, text: `${destination.rating} rating`, color: "text-gold-accent fill-current" },
                        { icon: Users, text: `Up to ${destination.maxGuests} guests`, color: "text-lavender-accent" },
                        { icon: Check, text: "All inclusive", color: "text-green-500" }
                      ].map((item, idx) => (
                        <motion.div
                          key={idx}
                          className="flex items-center"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + idx * 0.1 }}
                          whileHover={{ scale: 1.05, x: 5 }}
                        >
                          <item.icon className={`w-4 h-4 mr-2 ${item.color}`} />
                          <span>{item.text}</span>
                        </motion.div>
                      ))}
                    </motion.div>

                    <motion.div 
                      className="text-center py-4 border-t border-gold-accent/20"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.2, type: "spring" }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <motion.div 
                        className="text-3xl font-bold text-gold-accent"
                        animate={{ textShadow: ["0 0 10px rgba(255,215,0,0.5)", "0 0 20px rgba(255,215,0,0.8)", "0 0 10px rgba(255,215,0,0.5)"] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        ${destination.price}
                      </motion.div>
                      <div className="text-sm text-muted-foreground">per person</div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Enhanced Booking Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <Card className="glass-morphism border-gold-accent/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Calendar className="w-5 h-5 text-gold-accent" />
                    </motion.div>
                    <span>Booking Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Date Selection with Microinteractions */}
                  <motion.div 
                    className="grid grid-cols-2 gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    {[
                      { id: "check-in", label: "Check-in Date", value: checkIn, onChange: setCheckIn },
                      { id: "check-out", label: "Check-out Date", value: checkOut, onChange: setCheckOut }
                    ].map((field, idx) => (
                      <motion.div 
                        key={field.id}
                        className="space-y-2"
                        whileHover={{ scale: 1.02 }}
                        whileFocus={{ scale: 1.02 }}
                      >
                        <Label htmlFor={field.id}>{field.label}</Label>
                        <motion.div
                          whileFocus={{ boxShadow: "0 0 0 2px rgba(255,215,0,0.3)" }}
                        >
                          <Input
                            id={field.id}
                            type="date"
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="glass-input"
                          />
                        </motion.div>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Guests Selection */}
                  <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <Label htmlFor="guests">Number of Guests</Label>
                    <motion.div whileHover={{ scale: 1.02 }}>
                      <Select value={guests.toString()} onValueChange={(value) => setGuests(parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: destination.maxGuests }, (_, i) => i + 1).map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} {num === 1 ? 'Guest' : 'Guests'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </motion.div>
                  </motion.div>

                  {/* Travel Class with Animation */}
                  <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 }}
                  >
                    <Label>Travel Class</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {travelClasses.map((cls, idx) => (
                        <motion.div
                          key={cls.value}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.1 + idx * 0.1 }}
                        >
                          <Button
                            variant={travelClass === cls.value ? "default" : "outline"}
                            onClick={() => setTravelClass(cls.value)}
                            className="justify-start w-full"
                          >
                            <div className="text-left">
                              <div className="font-medium">{cls.label}</div>
                              <div className="text-xs text-muted-foreground">
                                {cls.price > 0 ? `+$${cls.price}` : 'Included'}
                              </div>
                            </div>
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Upgrades with Staggered Animation */}
                  <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                  >
                    <Label>Add-ons & Upgrades</Label>
                    <div className="space-y-2">
                      {upgrades.map((upgrade, idx) => {
                        const Icon = upgrade.icon;
                        const isSelected = selectedUpgrades.includes(upgrade.id);
                        return (
                          <motion.div
                            key={upgrade.id}
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1.3 + idx * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button
                              variant={isSelected ? "default" : "outline"}
                              onClick={() => handleUpgradeToggle(upgrade.id)}
                              className="w-full justify-between h-auto p-4"
                            >
                              <div className="flex items-center">
                                <motion.div
                                  animate={isSelected ? { rotate: 360 } : {}}
                                  transition={{ duration: 0.5 }}
                                >
                                  <Icon className="w-4 h-4 mr-3" />
                                </motion.div>
                                <span className="font-medium">{upgrade.name}</span>
                              </div>
                              <motion.span 
                                className="text-sm"
                                animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
                                transition={{ duration: 0.3 }}
                              >
                                ${upgrade.price}
                              </motion.span>
                            </Button>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>

                  {/* Price Breakdown Accordion */}
                  <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.6 }}
                  >
                    <motion.div whileHover={{ scale: 1.01 }}>
                      <Button
                        variant="ghost"
                        onClick={() => setShowPriceBreakdown(!showPriceBreakdown)}
                        className="w-full justify-between"
                      >
                        <span>Price Breakdown</span>
                        <motion.div
                          animate={{ rotate: showPriceBreakdown ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </motion.div>
                      </Button>
                    </motion.div>
                    
                    <AnimatePresence>
                      {showPriceBreakdown && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="bg-black/20 rounded-lg p-4 space-y-2 text-sm">
                            {[
                              { label: `Base price (${guests} guests)`, value: `$${(parseFloat(destination.price) * guests).toFixed(2)}` },
                              ...(travelClass !== "economy" ? [{ 
                                label: "Class upgrade", 
                                value: `$${(travelClasses.find(tc => tc.value === travelClass)?.price || 0) * guests}` 
                              }] : []),
                              ...selectedUpgrades.map(upgradeId => {
                                const upgrade = upgrades.find(u => u.id === upgradeId);
                                return upgrade ? { label: upgrade.name, value: `$${upgrade.price}` } : null;
                              }).filter((item): item is {label: string; value: string} => item !== null)
                            ].map((item, idx) => (
                              <motion.div
                                key={idx}
                                className="flex justify-between"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                              >
                                <span>{item.label}</span>
                                <span>{item.value}</span>
                              </motion.div>
                            ))}
                            <Separator />
                            <motion.div 
                              className="flex justify-between font-semibold"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.3, type: "spring" }}
                            >
                              <span>Total</span>
                              <span>${calculateTotal().toFixed(2)}</span>
                            </motion.div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Enhanced Book Now Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.8, type: "spring" }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={handleBookNow}
                        disabled={createBooking.isPending || !checkIn || !checkOut}
                        className="w-full h-12 bg-gradient-to-r from-gold-accent to-lavender-accent hover:from-gold-accent/80 hover:to-lavender-accent/80 text-white font-semibold transition-all duration-300 relative overflow-hidden"
                      >
                        {createBooking.isPending ? (
                          <motion.div 
                            className="flex items-center space-x-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <motion.div 
                              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            <span>Processing...</span>
                          </motion.div>
                        ) : (
                          <motion.div 
                            className="flex items-center space-x-2"
                            whileHover={{ x: 2 }}
                          >
                            <CreditCard className="w-4 h-4" />
                            <span>Book Now - ${calculateTotal().toFixed(2)}</span>
                          </motion.div>
                        )}
                        
                        {/* Shimmer effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          animate={{ x: ["-100%", "100%"] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          style={{ transform: "skewX(-20deg)" }}
                        />
                      </Button>
                    </motion.div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}