import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "");
import {
  ArrowLeft,
  CreditCard,
  Lock,
  CheckCircle,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";

interface PaymentData {
  bookingId: number;
  destinationName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  travelClass: string;
  upgrades: string[];
}

function PaymentForm({ paymentData }: { paymentData: PaymentData }) {
  const stripe = useStripe();
  const elements = useElements();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState("");

  // Create payment intent
  const { mutate: createPaymentIntent } = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/create-payment-intent", {
        amount: paymentData.totalAmount,
        bookingId: paymentData.bookingId,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
    },
    onError: () => {
      toast({
        title: "Payment Setup Failed",
        description: "Unable to initialize payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Confirm payment
  const { mutate: confirmPayment } = useMutation({
    mutationFn: async (paymentIntentId: string) => {
      const response = await apiRequest("POST", "/api/confirm-payment", {
        paymentIntentId,
        bookingId: paymentData.bookingId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Payment Successful!",
        description: "Your trip has been booked successfully.",
      });
      navigate("/my-trips");
    },
    onError: () => {
      toast({
        title: "Payment Confirmation Failed",
        description: "Payment was processed but booking confirmation failed. Please contact support.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    createPaymentIntent();
  }, []);

  const handlePayment = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/my-trips`,
        },
        redirect: "if_required",
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message || "An error occurred during payment.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment Successful!",
          description: "Your trip has been booked successfully.",
        });
        navigate("/my-trips");
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const paymentElementOptions = {
    layout: "tabs" as const,
  };

  return (
    <div className="min-h-screen pt-32 pb-16 px-6 bg-gradient-to-br from-space-blue via-deep-purple to-cosmic-black">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/booking/${paymentData.bookingId}`)}
            className="mb-4 text-gold-accent hover:text-gold-accent/80"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Booking
          </Button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gold-accent to-lavender-accent bg-clip-text text-transparent mb-2">
            Complete Your Payment
          </h1>
          <p className="text-muted-foreground text-lg">
            Secure payment for your {paymentData.destinationName} adventure
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Booking Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-morphism border-border">
              <CardHeader>
                <CardTitle className="flex items-center text-gold-accent">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Booking Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Destination</span>
                    <span className="font-medium">{paymentData.destinationName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check-in</span>
                    <span className="font-medium">{format(new Date(paymentData.checkIn), "MMM dd, yyyy")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check-out</span>
                    <span className="font-medium">{format(new Date(paymentData.checkOut), "MMM dd, yyyy")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Guests</span>
                    <span className="font-medium">{paymentData.guests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Travel Class</span>
                    <span className="font-medium capitalize">{paymentData.travelClass}</span>
                  </div>
                  {paymentData.upgrades.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Upgrades</span>
                      <span className="font-medium">{paymentData.upgrades.length} selected</span>
                    </div>
                  )}
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Amount</span>
                  <span className="text-gold-accent">${paymentData.totalAmount.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Payment Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-morphism border-border">
              <CardHeader>
                <CardTitle className="flex items-center text-gold-accent">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePayment} className="space-y-6">
                  <div className="space-y-4">
                    <div className="p-4 border border-border rounded-lg bg-background/20">
                      <PaymentElement options={paymentElementOptions} />
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Lock className="w-4 h-4 mr-2" />
                      Your payment information is encrypted and secure
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={!stripe || isProcessing || !clientSecret}
                    className="w-full bg-gold-accent hover:bg-gold-accent/80 text-primary-foreground font-bold py-4 glow-hover"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 mr-2" />
                        Pay ${paymentData.totalAmount.toLocaleString()}
                      </>
                    )}
                  </Button>

                  <div className="text-xs text-muted-foreground text-center space-y-1">
                    <p>By completing this payment, you agree to our terms of service.</p>
                    <p>Full refund available up to 48 hours before departure.</p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function Payment() {
  const [match, params] = useRoute("/payment/:bookingId");
  const [, navigate] = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const bookingId = params?.bookingId ? parseInt(params.bookingId) : 0;

  // Fetch booking details
  const { data: booking, isLoading, error } = useQuery({
    queryKey: ["/api/bookings", bookingId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/bookings/${bookingId}`);
      return response.json();
    },
    enabled: !!bookingId && isAuthenticated,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to complete your payment",
        variant: "destructive",
      });
      navigate("/auth");
    }
  }, [isAuthenticated, authLoading, navigate, toast]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen pt-32 pb-16 px-6 bg-gradient-to-br from-space-blue via-deep-purple to-cosmic-black">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-gold-accent" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen pt-32 pb-16 px-6 bg-gradient-to-br from-space-blue via-deep-purple to-cosmic-black">
        <div className="max-w-4xl mx-auto text-center">
          <AlertCircle className="w-16 h-16 text-alert-red mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Booking Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The booking you're trying to pay for doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => navigate("/my-trips")}>
            Go to My Trips
          </Button>
        </div>
      </div>
    );
  }

  if (booking.paymentStatus === "paid") {
    return (
      <div className="min-h-screen pt-32 pb-16 px-6 bg-gradient-to-br from-space-blue via-deep-purple to-cosmic-black">
        <div className="max-w-4xl mx-auto text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Payment Already Completed</h1>
          <p className="text-muted-foreground mb-8">
            This booking has already been paid for and confirmed.
          </p>
          <Button onClick={() => navigate("/my-trips")}>
            View My Trips
          </Button>
        </div>
      </div>
    );
  }

  const paymentData: PaymentData = {
    bookingId: booking.id,
    destinationName: booking.destination.name,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    guests: booking.guests,
    totalAmount: parseFloat(booking.totalAmount),
    travelClass: booking.travelClass,
    upgrades: booking.upgrades || [],
  };

  if (!clientSecret) {
    return (
      <div className="min-h-screen pt-32 pb-16 px-6 bg-gradient-to-br from-space-blue via-deep-purple to-cosmic-black">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-gold-accent" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentForm paymentData={paymentData} />
    </Elements>
  );
}