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
  Sparkles,
  Camera,
  Mountain,
  Waves,
  TreePine,
  Coffee,
  Heart,
  Gift,
  Shield,
  Zap,
  Car
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

// Feature icons mapping
const featureIcons: { [key: string]: any } = {
  "temple tours": Camera,
  "tea ceremony": Coffee,
  "cultural immersion": Heart,
  "glacier hikes": Mountain,
  "northern lights": Sparkles,
  "wildlife safari": TreePine,
  "beach activities": Waves,
  "city exploration": MapPin,
  "local cuisine": Coffee,
  "photography": Camera,
  "adventure": Zap,
  "relaxation": Heart
};

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
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);
  const [activeItineraryDay, setActiveItineraryDay] = useState(1);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

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



  // Get feature icon
  const getFeatureIcon = (feature: string) => {
    const lowerFeature = feature.toLowerCase();
    for (const [key, icon] of Object.entries(featureIcons)) {
      if (lowerFeature.includes(key)) return icon;
    }
    return Sparkles;
  };

  // Handle booking confirmation
  const handleBookNowWithAnimation = () => {
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

    setBookingConfirmed(true);
    
    // Delay the actual booking to show animation
    setTimeout(() => {
      createBooking.mutate(bookingData);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-space-blue via-deep-purple to-cosmic-black">
      {/* Stunning Hero Section */}
      <section className="relative h-screen overflow-hidden">
        {/* Dynamic Background based on destination */}
        <div className="absolute inset-0">
          <img
            src={destination.imageUrl}
            alt={destination.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          
          {/* Animated particles for destinations like Tokyo */}
          {destination.name.toLowerCase().includes('cherry') && (
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-pink-300 rounded-full opacity-70"
                  initial={{ 
                    x: Math.random() * window.innerWidth,
                    y: -20,
                    rotate: 0 
                  }}
                  animate={{ 
                    x: Math.random() * window.innerWidth,
                    y: window.innerHeight + 20,
                    rotate: 360 
                  }}
                  transition={{ 
                    duration: Math.random() * 10 + 10,
                    repeat: Infinity,
                    ease: "linear",
                    delay: Math.random() * 5
                  }}
                />
              ))}
            </div>
          )}

          {/* Aurora effect for Northern Lights destinations */}
          {destination.name.toLowerCase().includes('northern lights') && (
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
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex items-center justify-center h-full px-6">
          <div className="text-center text-white max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="mb-6"
            >
              <Button 
                variant="ghost" 
                onClick={() => navigate("/destinations")}
                className="mb-8 text-white/80 hover:text-white border border-white/20 hover:border-white/40"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Destinations
              </Button>
              
              <h1 className={`text-6xl md:text-8xl font-bold mb-4 leading-tight ${
                destination.name.toLowerCase().includes('cherry') ? 'font-serif text-pink-100' :
                destination.name.toLowerCase().includes('iceland') ? 'font-bold text-blue-100' :
                destination.name.toLowerCase().includes('santorini') ? 'font-light text-blue-50' :
                'text-white'
              }`}>
                {destination.name}
              </h1>
              
              <div className="flex items-center justify-center space-x-6 mb-6">
                <div className="flex items-center bg-black/30 rounded-full px-4 py-2 backdrop-blur-sm">
                  <Star className="w-5 h-5 text-gold-accent fill-current mr-2" />
                  <span className="text-xl font-semibold">★ {destination.rating}</span>
                </div>
                <div className="flex items-center bg-black/30 rounded-full px-4 py-2 backdrop-blur-sm">
                  <MapPin className="w-5 h-5 text-lavender-accent mr-2" />
                  <span className="text-xl">{destination.country}</span>
                </div>
              </div>

              <p className={`text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed ${
                destination.name.toLowerCase().includes('cherry') ? 'text-pink-100/90 italic' :
                destination.name.toLowerCase().includes('iceland') ? 'text-blue-100/90 font-medium' :
                destination.name.toLowerCase().includes('santorini') ? 'text-blue-50/90' :
                'text-white/90'
              }`}>
                {destination.name.toLowerCase().includes('cherry') ? 'Wander through Japan\'s blooming beauty' :
                 destination.name.toLowerCase().includes('iceland') ? 'Witness nature\'s most spectacular light show' :
                 destination.name.toLowerCase().includes('santorini') ? 'Experience the magic of the Aegean paradise' :
                 'Discover your next unforgettable adventure'}
              </p>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="inline-block"
              >
                <Button
                  onClick={() => document.getElementById('trip-highlights')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-gradient-to-r from-gold-accent to-lavender-accent hover:from-gold-accent/80 hover:to-lavender-accent/80 text-white font-semibold text-lg px-8 py-4 rounded-full"
                >
                  Explore This Adventure
                  <ChevronDown className="w-5 h-5 ml-2" />
                </Button>
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
      </section>

      {/* Dynamic Itinerary Tab System */}
      <section className="py-20 px-6 bg-gradient-to-br from-black/10 via-transparent to-black/10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gold-accent to-lavender-accent bg-clip-text text-transparent mb-4">
              Your Journey Unfolds
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore each day of your adventure at your own pace
            </p>
          </motion.div>

          {destination.itinerary && (
            <div className="space-y-8">
              {/* Day Tabs */}
              <div className="flex justify-center">
                <div className="flex space-x-1 bg-black/20 rounded-full p-1 backdrop-blur-sm">
                  {destination.itinerary.map((day: any, index: number) => (
                    <motion.button
                      key={day.day}
                      onClick={() => setActiveItineraryDay(day.day)}
                      className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                        activeItineraryDay === day.day
                          ? 'bg-gradient-to-r from-gold-accent to-lavender-accent text-white shadow-lg'
                          : 'text-muted-foreground hover:text-gold-accent hover:bg-white/10'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      Day {day.day}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Active Day Content */}
              <AnimatePresence mode="wait">
                {destination.itinerary.map((day: any) => 
                  activeItineraryDay === day.day && (
                    <motion.div
                      key={day.day}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.5 }}
                      className="max-w-4xl mx-auto"
                    >
                      <Card className="glass-morphism border-gold-accent/20 overflow-hidden">
                        <div className="grid md:grid-cols-2 gap-0">
                          <div className="relative h-80 md:h-auto">
                            <img
                              src={day.imageUrl}
                              alt={day.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <div className="absolute bottom-6 left-6 text-white">
                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="inline-block bg-gold-accent/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm mb-2"
                              >
                                Day {day.day}
                              </motion.div>
                            </div>
                          </div>
                          <div className="p-8 flex flex-col justify-center">
                            <motion.h3
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 }}
                              className={`text-3xl font-bold mb-4 ${
                                destination.name.toLowerCase().includes('cherry') ? 'text-pink-600' :
                                destination.name.toLowerCase().includes('iceland') ? 'text-blue-600' :
                                destination.name.toLowerCase().includes('santorini') ? 'text-blue-500' :
                                'text-gold-accent'
                              }`}
                            >
                              {day.title}
                            </motion.h3>
                            <motion.p
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.4 }}
                              className="text-muted-foreground text-lg leading-relaxed"
                            >
                              {day.description}
                            </motion.p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      {/* Interactive Trip Highlights Section */}
      <section id="trip-highlights" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gold-accent to-lavender-accent bg-clip-text text-transparent mb-4">
              Trip Highlights
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover the extraordinary experiences that make this journey unforgettable
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {destination.features?.map((feature: string, index: number) => {
              const IconComponent = getFeatureIcon(feature);
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group"
                  onMouseEnter={() => setHoveredFeature(feature)}
                  onMouseLeave={() => setHoveredFeature(null)}
                >
                  <Card className="glass-morphism border-gold-accent/20 h-full cursor-pointer overflow-hidden group-hover:border-gold-accent/40 transition-all duration-300">
                    <CardContent className="p-6 h-full flex flex-col">
                      <motion.div
                        className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-gold-accent/20 to-lavender-accent/20 mb-4 mx-auto"
                        whileHover={{ scale: 1.1, rotate: 360 }}
                        transition={{ duration: 0.3 }}
                      >
                        <IconComponent className="w-8 h-8 text-gold-accent" />
                      </motion.div>
                      
                      <h3 className="text-xl font-semibold text-center mb-3 group-hover:text-gold-accent transition-colors duration-300">
                        {feature}
                      </h3>
                      
                      <AnimatePresence>
                        {hoveredFeature === feature && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-sm text-muted-foreground text-center leading-relaxed"
                          >
                            Experience the wonder of {feature.toLowerCase()} with expert guides and premium amenities.
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Enhanced Booking Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-black/20 via-transparent to-black/20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gold-accent to-lavender-accent bg-clip-text text-transparent mb-4">
              Complete Your Booking
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Secure your adventure with our seamless booking experience
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Trip Summary */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="glass-morphism border-gold-accent/20 mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-gold-accent" />
                    <span>Trip Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden">
                    <img
                      src={destination.imageUrl}
                      alt={destination.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-xl font-bold">{destination.name}</h3>
                      <p className="text-sm opacity-90">{destination.country}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-lavender-accent" />
                      <span>{destination.duration} days</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-2 text-gold-accent fill-current" />
                      <span>{destination.rating} rating</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-lavender-accent" />
                      <span>Up to {destination.maxGuests} guests</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="w-4 h-4 mr-2 text-green-500" />
                      <span>All inclusive</span>
                    </div>
                  </div>

                  <div className="text-center py-4 border-t border-gold-accent/20">
                    <div className="text-3xl font-bold text-gold-accent">
                      ${destination.price}
                    </div>
                    <div className="text-sm text-muted-foreground">per person</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Booking Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              {/* Booking Confirmation Animation */}
              <AnimatePresence>
                {bookingConfirmed && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
                  >
                    <motion.div
                      initial={{ y: 50 }}
                      animate={{ y: 0 }}
                      className="bg-gradient-to-r from-gold-accent to-lavender-accent p-8 rounded-2xl text-center max-w-md mx-4"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: "spring" }}
                        className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4"
                      >
                        <Check className="w-8 h-8 text-green-600" />
                      </motion.div>
                      <h3 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h3>
                      <p className="text-white/90 mb-4">
                        {destination.name.toLowerCase().includes('cherry') ? `Hi ${user?.firstName || user?.username}, you're off to Tokyo!` :
                         destination.name.toLowerCase().includes('iceland') ? `Hi ${user?.firstName || user?.username}, your Northern Lights adventure awaits!` :
                         destination.name.toLowerCase().includes('santorini') ? `Hi ${user?.firstName || user?.username}, your Greek island escape is confirmed!` :
                         `Hi ${user?.firstName || user?.username}, your ${destination.name} adventure is locked in!`}
                      </p>
                      
                      {/* Destination-specific animations */}
                      {destination.name.toLowerCase().includes('cherry') && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: [0, 1.2, 1] }}
                          transition={{ delay: 0.6, duration: 1 }}
                          className="text-6xl"
                        >
                          🌸
                        </motion.div>
                      )}
                      
                      {destination.name.toLowerCase().includes('iceland') && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0, 1, 0.8, 1] }}
                          transition={{ delay: 0.6, duration: 2, repeat: 2 }}
                          className="text-6xl"
                        >
                          🌌
                        </motion.div>
                      )}
                      
                      {destination.name.toLowerCase().includes('santorini') && (
                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.6, duration: 1 }}
                          className="text-6xl"
                        >
                          🌅
                        </motion.div>
                      )}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Card className="glass-morphism border-gold-accent/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-gold-accent" />
                    <span>Book Your Trip</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Dates with smooth animations */}
                  <motion.div 
                    className="grid grid-cols-2 gap-4"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div>
                      <Label htmlFor="checkin">Check-in</Label>
                      <Input
                        id="checkin"
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        min={format(new Date(), 'yyyy-MM-dd')}
                        className="transition-all duration-200 focus:border-gold-accent"
                      />
                    </div>
                    <div>
                      <Label htmlFor="checkout">Check-out</Label>
                      <Input
                        id="checkout"
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        min={checkIn}
                        className="transition-all duration-200 focus:border-gold-accent"
                      />
                    </div>
                  </motion.div>

                  {/* Guests */}
                  <div>
                    <Label htmlFor="guests" className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-lavender-accent" />
                      Number of Guests
                    </Label>
                    <Select value={guests.toString()} onValueChange={(value) => setGuests(parseInt(value))}>
                      <SelectTrigger className="transition-all duration-200 focus:border-gold-accent">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: destination.maxGuests }, (_, i) => i + 1).map(num => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? 'Guest' : 'Guests'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Travel Class with icons */}
                  <div>
                    <Label className="flex items-center mb-3">
                      <Plane className="w-4 h-4 mr-2 text-gold-accent" />
                      Travel Class
                    </Label>
                    <div className="space-y-2">
                      {travelClasses.map(tc => (
                        <motion.div
                          key={tc.value}
                          className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                            travelClass === tc.value
                              ? 'border-gold-accent bg-gold-accent/10 shadow-lg'
                              : 'border-muted hover:border-gold-accent/50 hover:bg-gold-accent/5'
                          }`}
                          onClick={() => setTravelClass(tc.value)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Plane className="w-4 h-4 mr-2 text-lavender-accent" />
                              <span className="font-medium">{tc.label}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {tc.price > 0 ? `+$${tc.price}` : 'Included'}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Upgrades with toggle switches */}
                  <div>
                    <Label className="flex items-center mb-3">
                      <Sparkles className="w-4 h-4 mr-2 text-lavender-accent" />
                      Optional Upgrades
                    </Label>
                    <div className="space-y-3">
                      {upgrades.map(upgrade => {
                        const IconComponent = upgrade.icon;
                        const isSelected = selectedUpgrades.includes(upgrade.id);
                        return (
                          <motion.div
                            key={upgrade.id}
                            className="p-4 border rounded-lg transition-all duration-200 border-muted hover:border-gold-accent/50"
                            whileHover={{ scale: 1.01 }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center flex-1">
                                <IconComponent className="w-5 h-5 mr-3 text-gold-accent" />
                                <div className="flex-1">
                                  <div className="font-medium">✓ {upgrade.name}</div>
                                  <div className="text-sm text-muted-foreground">${upgrade.price}</div>
                                </div>
                              </div>
                              
                              {/* Toggle Switch */}
                              <motion.button
                                onClick={() => handleUpgradeToggle(upgrade.id)}
                                className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                                  isSelected 
                                    ? 'bg-gradient-to-r from-gold-accent to-lavender-accent' 
                                    : 'bg-muted'
                                }`}
                                whileTap={{ scale: 0.95 }}
                              >
                                <motion.div
                                  className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-lg"
                                  animate={{
                                    x: isSelected ? 26 : 2,
                                  }}
                                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                              </motion.button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  <Separator className="bg-gold-accent/20" />

                  {/* Price Breakdown */}
                  <div className="space-y-3">
                    <Button
                      variant="ghost"
                      onClick={() => setShowPriceBreakdown(!showPriceBreakdown)}
                      className="w-full justify-between p-0 h-auto font-normal"
                    >
                      <span>Price Breakdown</span>
                      <motion.div
                        animate={{ rotate: showPriceBreakdown ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </motion.div>
                    </Button>
                    
                    <AnimatePresence>
                      {showPriceBreakdown && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-2 text-sm"
                        >
                          <div className="flex justify-between">
                            <span>Base price ({guests} guests)</span>
                            <span>${(parseFloat(destination.price) * guests).toFixed(2)}</span>
                          </div>
                          {travelClass !== "economy" && (
                            <div className="flex justify-between">
                              <span>Class upgrade</span>
                              <span>+${(travelClasses.find(tc => tc.value === travelClass)?.price || 0) * guests}</span>
                            </div>
                          )}
                          {selectedUpgrades.length > 0 && (
                            <div className="flex justify-between">
                              <span>Upgrades</span>
                              <span>+${selectedUpgrades.reduce((total, id) => total + (upgrades.find(u => u.id === id)?.price || 0), 0)}</span>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-gold-accent/20">
                      <span>Total</span>
                      <motion.span 
                        key={calculateTotal()}
                        initial={{ scale: 1.2, color: "#fbbf24" }}
                        animate={{ scale: 1, color: "#d4af37" }}
                        transition={{ duration: 0.3 }}
                        className="text-gold-accent"
                      >
                        ${calculateTotal().toFixed(2)}
                      </motion.span>
                    </div>
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={handleBookNowWithAnimation}
                      disabled={createBooking.isPending || !checkIn || !checkOut || bookingConfirmed}
                      className="w-full h-12 bg-gradient-to-r from-gold-accent to-lavender-accent hover:from-gold-accent/80 hover:to-lavender-accent/80 text-white font-semibold transition-all duration-300"
                    >
                      {createBooking.isPending ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                          <span>Processing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <CreditCard className="w-4 h-4" />
                          <span>Book Now</span>
                        </div>
                      )}
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

