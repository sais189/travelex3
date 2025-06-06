import { useState, useEffect } from "react";
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
  Shield
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-space-blue via-deep-purple to-cosmic-black">
      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={destination.imageUrl}
            alt={destination.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex items-center justify-center h-full px-6">
          <div className="text-center text-white max-w-4xl">
            <div className="mb-6">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/destinations")}
                className="mb-8 text-white/80 hover:text-white border border-white/20 hover:border-white/40"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Destinations
              </Button>
              
              <h1 className="text-6xl md:text-8xl font-bold mb-4 leading-tight text-white">
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

              <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed text-white/90">
                {destination.description}
              </p>
              
              <div className="inline-block">
                <Button
                  onClick={() => document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-gradient-to-r from-gold-accent to-lavender-accent hover:from-gold-accent/80 hover:to-lavender-accent/80 text-white font-semibold text-lg px-8 py-4 rounded-full"
                >
                  Book This Adventure
                  <ChevronDown className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section id="booking-form" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gold-accent to-lavender-accent bg-clip-text text-transparent mb-4">
              Complete Your Booking
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Secure your adventure with our seamless booking experience
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Trip Summary */}
            <div>
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
            </div>

            {/* Booking Form */}
            <div>
              <Card className="glass-morphism border-gold-accent/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-gold-accent" />
                    <span>Booking Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Date Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="check-in">Check-in Date</Label>
                      <Input
                        id="check-in"
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="glass-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="check-out">Check-out Date</Label>
                      <Input
                        id="check-out"
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="glass-input"
                      />
                    </div>
                  </div>

                  {/* Guests */}
                  <div className="space-y-2">
                    <Label htmlFor="guests">Number of Guests</Label>
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
                  </div>

                  {/* Travel Class */}
                  <div className="space-y-2">
                    <Label>Travel Class</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {travelClasses.map((cls) => (
                        <Button
                          key={cls.value}
                          variant={travelClass === cls.value ? "default" : "outline"}
                          onClick={() => setTravelClass(cls.value)}
                          className="justify-start"
                        >
                          <div className="text-left">
                            <div className="font-medium">{cls.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {cls.price > 0 ? `+$${cls.price}` : 'Included'}
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Upgrades */}
                  <div className="space-y-2">
                    <Label>Add-ons & Upgrades</Label>
                    <div className="space-y-2">
                      {upgrades.map((upgrade) => {
                        const Icon = upgrade.icon;
                        const isSelected = selectedUpgrades.includes(upgrade.id);
                        return (
                          <Button
                            key={upgrade.id}
                            variant={isSelected ? "default" : "outline"}
                            onClick={() => handleUpgradeToggle(upgrade.id)}
                            className="w-full justify-between h-auto p-4"
                          >
                            <div className="flex items-center">
                              <Icon className="w-4 h-4 mr-3" />
                              <span className="font-medium">{upgrade.name}</span>
                            </div>
                            <span className="text-sm">${upgrade.price}</span>
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      onClick={() => setShowPriceBreakdown(!showPriceBreakdown)}
                      className="w-full justify-between"
                    >
                      <span>Price Breakdown</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${showPriceBreakdown ? 'rotate-180' : ''}`} />
                    </Button>
                    
                    {showPriceBreakdown && (
                      <div className="bg-black/20 rounded-lg p-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Base price ({guests} guests)</span>
                          <span>${(parseFloat(destination.price) * guests).toFixed(2)}</span>
                        </div>
                        {travelClass !== "economy" && (
                          <div className="flex justify-between">
                            <span>Class upgrade</span>
                            <span>${(travelClasses.find(tc => tc.value === travelClass)?.price || 0) * guests}</span>
                          </div>
                        )}
                        {selectedUpgrades.map((upgradeId) => {
                          const upgrade = upgrades.find(u => u.id === upgradeId);
                          return upgrade ? (
                            <div key={upgradeId} className="flex justify-between">
                              <span>{upgrade.name}</span>
                              <span>${upgrade.price}</span>
                            </div>
                          ) : null;
                        })}
                        <Separator />
                        <div className="flex justify-between font-semibold">
                          <span>Total</span>
                          <span>${calculateTotal().toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Book Now Button */}
                  <div>
                    <Button
                      onClick={handleBookNow}
                      disabled={createBooking.isPending || !checkIn || !checkOut}
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
                          <span>Book Now - ${calculateTotal().toFixed(2)}</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}