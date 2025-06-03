import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
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
  ChevronDown
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

// Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "");

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
  { id: "priority-boarding", name: "Priority Boarding", price: 50 },
  { id: "extra-luggage", name: "Extra Luggage", price: 75 },
  { id: "travel-insurance", name: "Travel Insurance", price: 100 },
  { id: "airport-transfer", name: "Airport Transfer", price: 120 }
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
  const [clientSecret, setClientSecret] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

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
        description: "Your booking has been created successfully",
      });
      // Create payment intent
      createPaymentIntent.mutate(data.id);
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create booking",
        variant: "destructive",
      });
    },
  });

  // Create payment intent mutation
  const createPaymentIntent = useMutation({
    mutationFn: async (bookingId: number) => {
      const response = await apiRequest("POST", "/api/create-payment-intent", {
        amount: calculateTotal(),
        bookingId
      });
      return response.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
    },
    onError: (error: any) => {
      toast({
        title: "Payment Setup Failed",
        description: error.message || "Failed to setup payment",
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

  if (clientSecret) {
    return (
      <div className="min-h-screen pt-32 pb-16 px-6 bg-gradient-to-br from-space-blue via-deep-purple to-cosmic-black">
        <div className="max-w-2xl mx-auto">
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <PaymentForm 
              destination={destination} 
              total={calculateTotal()}
              onSuccess={() => {
                toast({
                  title: "Payment Successful!",
                  description: "Your booking has been confirmed",
                });
                navigate("/my-trips");
              }}
            />
          </Elements>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-16 px-6 bg-gradient-to-br from-space-blue via-deep-purple to-cosmic-black">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button 
            variant="ghost" 
            onClick={() => navigate("/destinations")}
            className="mb-4 text-gold-accent hover:text-gold-accent/80"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Destinations
          </Button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gold-accent to-lavender-accent bg-clip-text text-transparent mb-2">
            Book Your Adventure
          </h1>
          <p className="text-muted-foreground text-lg">
            Complete your booking for {destination.name}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Destination Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="space-y-6">
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src={destination.imageUrl}
                  alt={destination.name}
                  className="w-full h-80 object-cover"
                />
                <div className="absolute top-4 right-4">
                  <Badge className="bg-black/50 text-white">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    {destination.rating}
                  </Badge>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-3xl font-bold">{destination.name}</h2>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gold-accent">
                      ${destination.price}
                    </div>
                    <div className="text-sm text-muted-foreground">per person</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {destination.country}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {destination.duration} days
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    Up to {destination.maxGuests} guests
                  </div>
                </div>

                <p className="text-muted-foreground mb-6">{destination.description}</p>

                <div>
                  <h3 className="font-semibold mb-3">What's Included</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {destination.features?.map((feature: string, index: number) => (
                      <div key={index} className="flex items-center">
                        <Check className="w-4 h-4 text-green-500 mr-2" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Booking Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="glass-morphism border-gold-accent/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Book Your Trip</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="checkin">Check-in</Label>
                    <Input
                      id="checkin"
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      min={format(new Date(), 'yyyy-MM-dd')}
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
                    />
                  </div>
                </div>

                {/* Guests */}
                <div>
                  <Label htmlFor="guests">Number of Guests</Label>
                  <Select value={guests.toString()} onValueChange={(value) => setGuests(parseInt(value))}>
                    <SelectTrigger>
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

                {/* Travel Class */}
                <div>
                  <Label>Travel Class</Label>
                  <div className="space-y-2 mt-2">
                    {travelClasses.map(tc => (
                      <div
                        key={tc.value}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          travelClass === tc.value
                            ? 'border-gold-accent bg-gold-accent/10'
                            : 'border-muted hover:border-gold-accent/50'
                        }`}
                        onClick={() => setTravelClass(tc.value)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Plane className="w-4 h-4 mr-2" />
                            <span className="font-medium">{tc.label}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {tc.price > 0 ? `+$${tc.price}` : 'Included'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upgrades */}
                <div>
                  <Label>Optional Upgrades</Label>
                  <div className="space-y-2 mt-2">
                    {upgrades.map(upgrade => (
                      <div
                        key={upgrade.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedUpgrades.includes(upgrade.id)
                            ? 'border-gold-accent bg-gold-accent/10'
                            : 'border-muted hover:border-gold-accent/50'
                        }`}
                        onClick={() => handleUpgradeToggle(upgrade.id)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{upgrade.name}</span>
                          <span className="text-sm text-muted-foreground">+${upgrade.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Total */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Base price ({guests} guests)</span>
                    <span>${(parseFloat(destination.price) * guests).toFixed(2)}</span>
                  </div>
                  {travelClass !== "economy" && (
                    <div className="flex justify-between text-sm">
                      <span>Class upgrade</span>
                      <span>+${(travelClasses.find(tc => tc.value === travelClass)?.price || 0) * guests}</span>
                    </div>
                  )}
                  {selectedUpgrades.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Upgrades</span>
                      <span>+${selectedUpgrades.reduce((total, id) => total + (upgrades.find(u => u.id === id)?.price || 0), 0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span className="text-gold-accent">${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  onClick={handleBookNow}
                  disabled={createBooking.isPending || !checkIn || !checkOut}
                  className="w-full h-12 bg-gradient-to-r from-gold-accent to-lavender-accent hover:from-gold-accent/80 hover:to-lavender-accent/80 text-white font-semibold"
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
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Payment form component (simplified for now)
function PaymentForm({ destination, total, onSuccess }: any) {
  return (
    <Card className="glass-morphism border-gold-accent/20">
      <CardHeader>
        <CardTitle>Complete Payment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <span>{destination.name}</span>
              <span className="font-bold">${total.toFixed(2)}</span>
            </div>
          </div>
          <Button onClick={onSuccess} className="w-full">
            Complete Payment (Demo)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}