import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  Users,
  MapPin,
  ClipboardList,
  DollarSign,
  TrendingUp,
  Star,
  Plus,
  Edit,
  Trash2,
  LogOut,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import type { User, DestinationWithStats, ActivityLog, BookingWithDetails } from "@shared/schema";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Analytics {
  revenue: { total: string; period: string };
  bookings: { total: number; thisMonth: number; growth: number };
  users: { total: number; active: number; growth: number };
}

export default function Admin() {
  const params = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState(params.tab || "overview");
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deleteDestinationId, setDeleteDestinationId] = useState<number | null>(null);

  // Check admin access
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'admin')) {
      toast({
        title: "Access Denied",
        description: "Admin access required",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [isAuthenticated, user, authLoading, navigate, toast]);

  // Analytics data
  const { data: analytics, isLoading: analyticsLoading } = useQuery<Analytics>({
    queryKey: ["/api/admin/analytics"],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  // Users data
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  // Destinations data
  const { data: destinations = [], isLoading: destinationsLoading } = useQuery<DestinationWithStats[]>({
    queryKey: ["/api/admin/destinations"],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  // Activity logs
  const { data: logs = [], isLoading: logsLoading } = useQuery<ActivityLog[]>({
    queryKey: ["/api/admin/logs"],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  // Recent bookings
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<BookingWithDetails[]>({
    queryKey: ["/api/admin/bookings"],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest("DELETE", `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setDeleteUserId(null);
      toast({
        title: "User Deleted",
        description: "User has been successfully deleted",
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
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete destination mutation
  const deleteDestinationMutation = useMutation({
    mutationFn: async (destinationId: number) => {
      return apiRequest("DELETE", `/api/admin/destinations/${destinationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/destinations"] });
      setDeleteDestinationId(null);
      toast({
        title: "Destination Deleted",
        description: "Destination has been successfully deleted",
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
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (authLoading || !isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-12 w-96 mb-8" />
          <div className="grid md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const recentBookings = bookings.slice(0, 5);

  return (
    <div className="min-h-screen pt-32 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-6 md:mb-0">
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your travel platform</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-muted-foreground">Welcome, {user?.firstName || 'Admin'}</span>
            <a href="/api/logout">
              <Button variant="outline" className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </a>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-slate-panel">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gold-accent data-[state=active]:text-primary-foreground">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-gold-accent data-[state=active]:text-primary-foreground">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="destinations" className="data-[state=active]:bg-gold-accent data-[state=active]:text-primary-foreground">
              <MapPin className="w-4 h-4 mr-2" />
              Destinations
            </TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-gold-accent data-[state=active]:text-primary-foreground">
              <ClipboardList className="w-4 h-4 mr-2" />
              Logs
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Stats Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="glass-morphism">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-3xl font-bold text-gold-accent">
                        {analyticsLoading ? "..." : `$${parseInt(analytics?.revenue.total || "0").toLocaleString()}k`}
                      </div>
                      <DollarSign className="w-8 h-8 text-gold-accent" />
                    </div>
                    <div className="text-muted-foreground">Monthly Revenue</div>
                    <div className="text-mint-accent text-sm mt-2">+12% from last month</div>
                  </CardContent>
                </Card>

                <Card className="glass-morphism">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-3xl font-bold text-lavender-accent">
                        {analyticsLoading ? "..." : analytics?.bookings.thisMonth || 0}
                      </div>
                      <TrendingUp className="w-8 h-8 text-lavender-accent" />
                    </div>
                    <div className="text-muted-foreground">New Bookings</div>
                    <div className="text-mint-accent text-sm mt-2">
                      +{analytics?.bookings.growth || 0}% from last month
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-morphism">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-3xl font-bold text-mint-accent">
                        {analyticsLoading ? "..." : analytics?.users.active || 0}
                      </div>
                      <Users className="w-8 h-8 text-mint-accent" />
                    </div>
                    <div className="text-muted-foreground">Active Users</div>
                    <div className="text-mint-accent text-sm mt-2">
                      +{analytics?.users.growth || 0}% from last month
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-morphism">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-3xl font-bold text-gold-accent">4.9</div>
                      <Star className="w-8 h-8 text-gold-accent" />
                    </div>
                    <div className="text-muted-foreground">Avg Rating</div>
                    <div className="text-mint-accent text-sm mt-2">+0.2 from last month</div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Section */}
              <div className="grid lg:grid-cols-2 gap-8 mb-8">
                <Card className="glass-morphism">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="w-5 h-5 text-gold-accent mr-2" />
                      Destination Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {destinationsLoading ? (
                      <Skeleton className="h-64 w-full" />
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          data={destinations
                            .filter(dest => dest.bookingCount && dest.bookingCount > 0)
                            .slice(0, 6)
                            .map(dest => ({
                              name: dest.name.length > 12 ? dest.name.substring(0, 12) + '...' : dest.name,
                              fullName: dest.name,
                              bookings: dest.bookingCount || 0,
                              revenue: parseFloat(dest.revenue || '0')
                            }))}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis 
                            dataKey="name" 
                            stroke="#9ca3af"
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis stroke="#9ca3af" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1f2937', 
                              border: '1px solid #d4af37',
                              borderRadius: '8px',
                              color: '#fff'
                            }}
                            formatter={(value: any, name: string) => {
                              if (name === 'revenue') {
                                return [`$${value.toLocaleString()}`, 'Revenue'];
                              }
                              return [value, 'Bookings'];
                            }}
                            labelFormatter={(label: string) => {
                              const item = destinations.find(d => d.name.startsWith(label.replace('...', '')));
                              return item?.name || label;
                            }}
                          />
                          <Bar dataKey="bookings" fill="#d4af37" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                <Card className="glass-morphism">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="w-5 h-5 text-lavender-accent mr-2" />
                      Revenue by Destination
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {destinationsLoading ? (
                      <Skeleton className="h-64 w-full" />
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          data={destinations
                            .filter(dest => dest.revenue && parseFloat(dest.revenue) > 0)
                            .slice(0, 6)
                            .map(dest => ({
                              name: dest.name.length > 12 ? dest.name.substring(0, 12) + '...' : dest.name,
                              fullName: dest.name,
                              revenue: parseFloat(dest.revenue || '0')
                            }))}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis 
                            dataKey="name" 
                            stroke="#9ca3af"
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis stroke="#9ca3af" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1f2937', 
                              border: '1px solid #b794f6',
                              borderRadius: '8px',
                              color: '#fff'
                            }}
                            formatter={(value: any) => [`$${value.toLocaleString()}`, 'Revenue']}
                            labelFormatter={(label: string) => {
                              const item = destinations.find(d => d.name.startsWith(label.replace('...', '')));
                              return item?.name || label;
                            }}
                          />
                          <Bar dataKey="revenue" fill="#b794f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div className="grid lg:grid-cols-2 gap-8">
                <Card className="glass-morphism">
                  <CardHeader>
                    <CardTitle>Recent Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {bookingsLoading ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {recentBookings.map((booking) => (
                          <div
                            key={booking.id}
                            className="flex items-center justify-between py-3 border-b border-border last:border-0"
                          >
                            <div>
                              <div className="font-semibold">{booking.destination.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {booking.user.firstName} {booking.user.lastName} - {booking.guests} guests
                              </div>
                            </div>
                            <div className="text-gold-accent font-bold">
                              ${parseFloat(booking.totalAmount).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="glass-morphism">
                  <CardHeader>
                    <CardTitle>Top Destinations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {destinationsLoading ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <Skeleton key={i} className="h-12 w-full" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {destinations.slice(0, 3).map((destination, index) => (
                          <div key={destination.id} className="flex items-center justify-between">
                            <span>{destination.name}</span>
                            <div className="flex items-center">
                              <div className="w-32 bg-border rounded-full h-2 mr-3">
                                <div
                                  className={`h-2 rounded-full ${
                                    index === 0 ? 'bg-gold-accent' : 
                                    index === 1 ? 'bg-lavender-accent' : 'bg-mint-accent'
                                  }`}
                                  style={{ width: `${85 - index * 15}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {destination.bookingCount || 0}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">User Management</h2>
              </div>

              <Card className="glass-morphism">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {usersLoading ? (
                          [...Array(5)].map((_, i) => (
                            <TableRow key={i}>
                              <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                            </TableRow>
                          ))
                        ) : (
                          users.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  {user.profileImageUrl ? (
                                    <img
                                      src={user.profileImageUrl}
                                      alt={user.firstName || 'User'}
                                      className="w-8 h-8 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 bg-slate-panel rounded-full flex items-center justify-center">
                                      <Users className="w-4 h-4" />
                                    </div>
                                  )}
                                  <span>{user.firstName} {user.lastName}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground">{user.email}</TableCell>
                              <TableCell>
                                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                  {user.role}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {formatDate(user.createdAt!)}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setDeleteUserId(user.id)}
                                  className="text-red-400 border-red-500 hover:bg-red-500 hover:text-white"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Destinations Tab */}
          <TabsContent value="destinations">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Destination Management</h2>
                <Button className="bg-gold-accent hover:bg-gold-accent/80 text-primary-foreground">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Destination
                </Button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {destinationsLoading ? (
                  [...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-64 rounded-2xl" />
                  ))
                ) : (
                  destinations.map((destination) => (
                    <Card key={destination.id} className="glass-morphism">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-xl font-semibold">{destination.name}</h3>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-gold-accent mr-1 fill-current" />
                            <span className="text-sm">{destination.rating}</span>
                          </div>
                        </div>
                        <p className="text-muted-foreground mb-4">{destination.shortDescription}</p>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-gold-accent font-bold text-lg">${destination.price}</span>
                          <Badge className="bg-mint-accent bg-opacity-20 text-mint-accent">
                            {destination.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-4">
                          Bookings: {destination.bookingCount || 0} | Revenue: ${destination.revenue || '0'}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 border-lavender-accent text-lavender-accent hover:bg-lavender-accent hover:text-primary-foreground"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteDestinationId(destination.id)}
                            className="flex-1 border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </motion.div>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl font-semibold mb-6">Activity Logs</h2>

              <Card className="glass-morphism">
                <CardContent className="p-6">
                  {logsLoading ? (
                    <div className="space-y-4">
                      {[...Array(10)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {logs.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-center justify-between py-3 border-b border-border last:border-0"
                        >
                          <div>
                            <div className="font-semibold capitalize">
                              {log.action.replace(/_/g, ' ')}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {log.description}
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(log.createdAt!)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete User Confirmation */}
      <Dialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <DialogContent className="glass-morphism border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-400">
              <AlertTriangle className="w-6 h-6 mr-2" />
              Delete User
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone and will remove all their data.
            </DialogDescription>
          </DialogHeader>
          <div className="flex space-x-4 mt-6">
            <Button
              variant="outline"
              onClick={() => setDeleteUserId(null)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => deleteUserId && deleteUserMutation.mutate(deleteUserId)}
              disabled={deleteUserMutation.isPending}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
            >
              {deleteUserMutation.isPending ? "Deleting..." : "Delete User"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Destination Confirmation */}
      <Dialog open={!!deleteDestinationId} onOpenChange={() => setDeleteDestinationId(null)}>
        <DialogContent className="glass-morphism border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-400">
              <AlertTriangle className="w-6 h-6 mr-2" />
              Delete Destination
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this destination? This action cannot be undone and may affect existing bookings.
            </DialogDescription>
          </DialogHeader>
          <div className="flex space-x-4 mt-6">
            <Button
              variant="outline"
              onClick={() => setDeleteDestinationId(null)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => deleteDestinationId && deleteDestinationMutation.mutate(deleteDestinationId)}
              disabled={deleteDestinationMutation.isPending}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
            >
              {deleteDestinationMutation.isPending ? "Deleting..." : "Delete Destination"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
