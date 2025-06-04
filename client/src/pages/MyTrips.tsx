import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, 
  Calendar, 
  Users, 
  MapPin, 
  Clock, 
  Star,
  Edit,
  X,
  AlertTriangle,
  TrendingUp,
  Globe,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import type { BookingWithDetails } from "@shared/schema";

export default function MyTrips() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [cancelBookingId, setCancelBookingId] = useState<number | null>(null);

  const { data: bookings = [], isLoading, error } = useQuery<BookingWithDetails[]>({
    queryKey: ["/api/bookings"],
    enabled: isAuthenticated,
    retry: false,
  });

  const cancelMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      return apiRequest("PUT", `/api/bookings/${bookingId}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      setCancelBookingId(null);
      toast({
        title: "Booking Cancelled",
        description: "Your booking has been successfully cancelled.",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Cancellation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  // Handle API errors
  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [error, toast]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen pt-32 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <Skeleton className="h-10 w-48 mb-2" />
              <Skeleton className="h-6 w-64" />
            </div>
            <Skeleton className="h-12 w-40" />
          </div>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const upcomingBookings = bookings.filter(
    booking => booking.status !== "cancelled" && booking.status !== "completed"
  );
  const pastBookings = bookings.filter(
    booking => booking.status === "completed"
  );
  const cancelledBookings = bookings.filter(
    booking => booking.status === "cancelled"
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-mint-accent bg-opacity-20 text-mint-accent";
      case "pending":
        return "bg-gold-accent bg-opacity-20 text-gold-accent";
      case "cancelled":
        return "bg-red-500 bg-opacity-20 text-red-400";
      case "completed":
        return "bg-blue-500 bg-opacity-20 text-blue-400";
      default:
        return "bg-gray-500 bg-opacity-20 text-gray-400";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmed";
      case "pending":
        return "Pending Payment";
      case "cancelled":
        return "Cancelled";
      case "completed":
        return "Completed";
      default:
        return status;
    }
  };

  const handleCancelBooking = (bookingId: number) => {
    setCancelBookingId(bookingId);
  };

  const confirmCancellation = () => {
    if (cancelBookingId) {
      cancelMutation.mutate(cancelBookingId);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const totalTrips = bookings.length;
  const countriesVisited = new Set(bookings.map(b => b.destination.country)).size;
  const totalKilometers = Math.round(
    bookings.reduce((total, booking) => {
      const distance = booking.destination.distanceKm ? parseFloat(booking.destination.distanceKm) : 0;
      return total + distance;
    }, 0)
  );

  const BookingCard = ({ booking }: { booking: BookingWithDetails }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="glass-morphism glow-hover">
        <CardContent className="p-6">
          <div className="grid lg:grid-cols-4 gap-6 items-center">
            <div className="lg:col-span-1">
              <img
                src={booking.destination.imageUrl || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4"}
                alt={booking.destination.name}
                className="w-full h-32 object-cover rounded-lg"
              />
            </div>
            <div className="lg:col-span-2">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-semibold">{booking.destination.name}</h3>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-gold-accent mr-1 fill-current" />
                  <span className="text-sm">{booking.destination.rating}</span>
                </div>
              </div>
              <div className="flex items-center mb-2 text-muted-foreground">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}</span>
              </div>
              <div className="flex items-center mb-2 text-muted-foreground">
                <Users className="w-4 h-4 mr-2" />
                <span>{booking.guests} Guest{booking.guests > 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center mb-4 text-muted-foreground">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{booking.destination.country}</span>
              </div>
              <Badge className={getStatusColor(booking.status)}>
                {getStatusText(booking.status)}
              </Badge>
            </div>
            <div className="lg:col-span-1 text-right">
              <div className="text-2xl font-bold text-gold-accent mb-4">
                ${parseFloat(booking.totalAmount).toLocaleString()}
              </div>
              <div className="space-y-2">
                <Button
                  onClick={() => navigate(`/booking/${booking.destinationId}`)}
                  className="w-full bg-lavender-accent hover:bg-lavender-accent/80 text-primary-foreground"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  View Details
                </Button>
                {booking.status !== "cancelled" && booking.status !== "completed" && (
                  <Button
                    variant="outline"
                    onClick={() => handleCancelBooking(booking.id)}
                    className="w-full border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel Trip
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const EmptyState = ({ title, description, actionText, onAction }: {
    title: string;
    description: string;
    actionText: string;
    onAction: () => void;
  }) => (
    <motion.div
      className="text-center py-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="w-24 h-24 bg-slate-panel rounded-full flex items-center justify-center mx-auto mb-6">
        <MapPin className="w-12 h-12 text-muted-foreground" />
      </div>
      <h3 className="text-2xl font-semibold mb-4">{title}</h3>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">{description}</p>
      <Button
        onClick={onAction}
        className="bg-gold-accent hover:bg-gold-accent/80 text-primary-foreground"
      >
        {actionText}
      </Button>
    </motion.div>
  );

  return (
    <div className="min-h-screen pt-32 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-6 md:mb-0">
            <h1 className="text-4xl font-bold mb-2">My Trips</h1>
            <p className="text-muted-foreground">Manage your upcoming and past adventures</p>
          </div>
          <Button
            onClick={() => navigate("/destinations")}
            className="bg-gold-accent hover:bg-gold-accent/80 text-primary-foreground glow-hover"
          >
            <Plus className="w-5 h-5 mr-2" />
            Book New Trip
          </Button>
        </motion.div>

        <Tabs defaultValue="upcoming" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 bg-slate-panel">
            <TabsTrigger value="upcoming" className="data-[state=active]:bg-gold-accent data-[state=active]:text-primary-foreground">
              Upcoming ({upcomingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="data-[state=active]:bg-gold-accent data-[state=active]:text-primary-foreground">
              Past ({pastBookings.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="data-[state=active]:bg-gold-accent data-[state=active]:text-primary-foreground">
              Cancelled ({cancelledBookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-6">
            {upcomingBookings.length > 0 ? (
              upcomingBookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <BookingCard booking={booking} />
                </motion.div>
              ))
            ) : (
              <EmptyState
                title="No Upcoming Trips"
                description="You don't have any upcoming trips. Start planning your next adventure!"
                actionText="Explore Destinations"
                onAction={() => navigate("/destinations")}
              />
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-6">
            {pastBookings.length > 0 ? (
              pastBookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <BookingCard booking={booking} />
                </motion.div>
              ))
            ) : (
              <EmptyState
                title="No Past Trips"
                description="You haven't completed any trips yet. Your travel history will appear here."
                actionText="Book Your First Trip"
                onAction={() => navigate("/destinations")}
              />
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-6">
            {cancelledBookings.length > 0 ? (
              cancelledBookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <BookingCard booking={booking} />
                </motion.div>
              ))
            ) : (
              <EmptyState
                title="No Cancelled Trips"
                description="You haven't cancelled any trips. All your bookings are in good standing!"
                actionText="Explore New Destinations"
                onAction={() => navigate("/destinations")}
              />
            )}
          </TabsContent>
        </Tabs>

        {/* Travel Stats */}
        {totalTrips > 0 && (
          <motion.div
            className="mt-16 grid md:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="glass-morphism text-center">
              <CardContent className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-gold-accent bg-opacity-20 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-gold-accent" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gold-accent mb-2">{totalTrips}</div>
                <div className="text-muted-foreground">Total Trips</div>
              </CardContent>
            </Card>
            <Card className="glass-morphism text-center">
              <CardContent className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-lavender-accent bg-opacity-20 rounded-full flex items-center justify-center">
                    <Globe className="w-6 h-6 text-lavender-accent" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-lavender-accent mb-2">{countriesVisited}</div>
                <div className="text-muted-foreground">Countries Visited</div>
              </CardContent>
            </Card>
            <Card className="glass-morphism text-center">
              <CardContent className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-mint-accent bg-opacity-20 rounded-full flex items-center justify-center">
                    <Award className="w-6 h-6 text-mint-accent" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-mint-accent mb-2">{totalKilometers.toLocaleString()}</div>
                <div className="text-muted-foreground">Kilometers Traveled</div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Cancellation Confirmation Dialog */}
      <Dialog open={!!cancelBookingId} onOpenChange={() => setCancelBookingId(null)}>
        <DialogContent className="glass-morphism border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center text-alert-red">
              <AlertTriangle className="w-6 h-6 mr-2" />
              Cancel Booking
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
              Please review our cancellation policy for refund details.
            </DialogDescription>
          </DialogHeader>
          <div className="flex space-x-4 mt-6">
            <Button
              variant="outline"
              onClick={() => setCancelBookingId(null)}
              className="flex-1"
            >
              Keep Booking
            </Button>
            <Button
              onClick={confirmCancellation}
              disabled={cancelMutation.isPending}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
            >
              {cancelMutation.isPending ? "Cancelling..." : "Cancel Trip"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
