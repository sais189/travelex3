import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Users, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Activity, 
  UserPlus, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  Search,
  MoreHorizontal,
  Shield,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

interface Analytics {
  revenue: { total: string; period: string };
  bookings: { total: number; thisMonth: number; growth: number };
  users: { total: number; active: number; growth: number };
}

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string;
  createdAt: string;
}

interface ActivityLog {
  id: number;
  userId: string;
  action: string;
  description: string;
  createdAt: string;
  user?: {
    username: string;
    firstName: string;
    lastName: string;
  };
}

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    role: "user",
    password: ""
  });
  const { toast } = useToast();

  // Fetch analytics data
  const { data: analytics } = useQuery<Analytics>({
    queryKey: ['/api/admin/analytics'],
  });

  // Fetch users
  const { data: users = [], refetch: refetchUsers } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
  });

  // Fetch activity logs
  const { data: activityLogs = [] } = useQuery<ActivityLog[]>({
    queryKey: ['/api/admin/activity-logs'],
  });

  // User management mutations
  const toggleUserStatus = useMutation({
    mutationFn: (userId: string) => apiRequest("PATCH", `/api/admin/users/${userId}/toggle-status`),
    onSuccess: () => {
      toast({
        title: "User status updated",
        description: "User status has been changed successfully",
      });
      refetchUsers();
      queryClient.invalidateQueries({ queryKey: ['/api/admin/activity-logs'] });
    },
  });

  const deleteUser = useMutation({
    mutationFn: (userId: string) => apiRequest("DELETE", `/api/admin/users/${userId}`),
    onSuccess: () => {
      toast({
        title: "User deleted",
        description: "User has been deleted successfully",
      });
      refetchUsers();
      queryClient.invalidateQueries({ queryKey: ['/api/admin/activity-logs'] });
    },
  });

  const addUser = useMutation({
    mutationFn: (userData: typeof newUser) => apiRequest("POST", "/api/admin/users", userData),
    onSuccess: () => {
      toast({
        title: "User created",
        description: "New user has been created successfully",
      });
      setShowAddUserDialog(false);
      setNewUser({
        username: "",
        email: "",
        firstName: "",
        lastName: "",
        role: "user",
        password: ""
      });
      refetchUsers();
      queryClient.invalidateQueries({ queryKey: ['/api/admin/activity-logs'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating user",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });

  // Fetch bookings data for charts
  const { data: bookings = [] } = useQuery({
    queryKey: ['/api/bookings'],
  });

  // Fetch destinations for charts
  const { data: destinations = [] } = useQuery({
    queryKey: ['/api/destinations'],
  });

  // Prepare chart data
  const revenueData = [
    { month: 'Jul', revenue: 325000, bookings: 2150 },
    { month: 'Aug', revenue: 400000, bookings: 1980 },
    { month: 'Sep', revenue: 380000, bookings: 1750 },
    { month: 'Oct', revenue: 540000, bookings: 2600 },
    { month: 'Nov', revenue: 900000, bookings: 4120 },
    { month: 'Dec', revenue: 1200000, bookings: 5300 },
    { month: 'Jan', revenue: 530000, bookings: 2550 },
  ];

  const destinationData = [
    { name: 'Safari Kenya', bookings: 6800, revenue: 1200000, color: '#8884d8' },
    { name: 'Iceland Northern Lights', bookings: 5450, revenue: 980000, color: '#82ca9d' },
    { name: 'Bali Serenity', bookings: 4100, revenue: 720000, color: '#ffc658' },
    { name: 'Patagonia Trek', bookings: 3200, revenue: 650000, color: '#ff7300' },
    { name: 'Santorini Sunset', bookings: 2750, revenue: 520000, color: '#8dd1e1' },
    { name: 'Tokyo Adventure', bookings: 2100, revenue: 380000, color: '#d084d0' },
  ];

  const statusData = [
    { name: 'Completed', value: 65, color: '#10b981' },
    { name: 'Confirmed', value: 25, color: '#3b82f6' },
    { name: 'Pending', value: 10, color: '#f59e0b' },
  ];

  // Filter users
  const filteredUsers = (users as User[]).filter((user: User) => {
    const matchesSearch = 
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && user.isActive) ||
      (statusFilter === "inactive" && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const StatCard = ({ title, value, icon: Icon, change, color }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="glass-morphism border-gold-accent/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold">{value}</p>
              {change && (
                <p className={`text-sm ${change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {change > 0 ? '+' : ''}{change}% from last month
                </p>
              )}
            </div>
            <div className={`p-3 rounded-full ${color}`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen pt-32 pb-16 px-6 bg-gradient-to-br from-space-blue via-deep-purple to-cosmic-black">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gold-accent to-lavender-accent bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage users, monitor activity, and oversee system operations
          </p>
        </motion.div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={analytics?.users?.total || 0}
            icon={Users}
            change={analytics?.users?.growth || 0}
            color="bg-gradient-to-r from-blue-500 to-blue-600"
          />
          <StatCard
            title="Active Users"
            value={analytics?.users?.active || 0}
            icon={Activity}
            color="bg-gradient-to-r from-green-500 to-green-600"
          />
          <StatCard
            title="Total Bookings"
            value={analytics?.bookings?.total || 0}
            icon={Calendar}
            change={analytics?.bookings?.growth || 0}
            color="bg-gradient-to-r from-purple-500 to-purple-600"
          />
          <StatCard
            title="Revenue"
            value={analytics?.revenue?.total ? `$${analytics.revenue.total}` : '$0'}
            icon={DollarSign}
            change={15}
            color="bg-gradient-to-r from-gold-500 to-gold-600"
          />
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Trends */}
          <Card className="glass-morphism border-gold-accent/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-gold-accent" />
                Revenue Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis 
                    stroke="#9ca3af" 
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #d4af37',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#d4af37" 
                    fill="url(#revenueGradient)" 
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d4af37" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#d4af37" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Booking Status Distribution */}
          <Card className="glass-morphism border-gold-accent/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gold-accent" />
                Booking Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #d4af37',
                      borderRadius: '8px',
                      color: '#fff'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Destination Performance */}
          <Card className="glass-morphism border-gold-accent/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gold-accent" />
                Destination Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={destinationData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    type="number" 
                    stroke="#9ca3af" 
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <YAxis dataKey="name" type="category" stroke="#9ca3af" width={120} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #d4af37',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="#d4af37" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Monthly Bookings */}
          <Card className="glass-morphism border-gold-accent/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-gold-accent" />
                Monthly Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis 
                    stroke="#9ca3af" 
                    tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #d4af37',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value) => [`${value.toLocaleString()}`, 'Bookings']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="bookings" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="activity">Activity Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card className="glass-morphism border-gold-accent/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>User Management</span>
                  </CardTitle>
                  <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-gold-accent to-lavender-accent">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add User
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] glass-morphism border-gold-accent/20">
                      <DialogHeader>
                        <DialogTitle>Add New User</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">First Name</label>
                            <Input
                              value={newUser.firstName}
                              onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                              placeholder="Enter first name"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Last Name</label>
                            <Input
                              value={newUser.lastName}
                              onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                              placeholder="Enter last name"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Username</label>
                          <Input
                            value={newUser.username}
                            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                            placeholder="Enter username"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Email</label>
                          <Input
                            type="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            placeholder="Enter email address"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Role</label>
                          <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="travel_agent">Travel Agent</SelectItem>
                              <SelectItem value="support">Support</SelectItem>
                              <SelectItem value="finance">Finance</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Password</label>
                          <Input
                            type="password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            placeholder="Enter password"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          onClick={() => setShowAddUserDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={() => addUser.mutate(newUser)}
                          disabled={addUser.isPending || !newUser.username || !newUser.email || !newUser.password}
                          className="bg-gradient-to-r from-gold-accent to-lavender-accent"
                        >
                          {addUser.isPending ? "Creating..." : "Create User"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="travel_agent">Travel Agent</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Users Table */}
                <div className="rounded-md border border-gold-accent/20">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user: User) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{user.firstName} {user.lastName}</div>
                              <div className="text-sm text-muted-foreground">
                                @{user.username} • {user.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={user.role === 'admin' ? 'default' : 'secondary'}
                              className={
                                user.role === 'admin' ? 'bg-red-600 text-white' :
                                user.role === 'travel_agent' ? 'bg-blue-600 text-white' :
                                user.role === 'support' ? 'bg-green-600 text-white' :
                                user.role === 'finance' ? 'bg-purple-600 text-white' :
                                'bg-gray-600 text-white'
                              }
                            >
                              {user.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                              {user.role.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.isActive ? 'default' : 'destructive'}>
                              {user.isActive ? (
                                <CheckCircle className="w-3 h-3 mr-1" />
                              ) : (
                                <XCircle className="w-3 h-3 mr-1" />
                              )}
                              {user.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-sm">
                              <Clock className="w-3 h-3 mr-1" />
                              {user.lastLoginAt 
                                ? format(new Date(user.lastLoginAt), 'MMM dd, yyyy')
                                : 'Never'
                              }
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit User
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => toggleUserStatus.mutate(user.id)}
                                >
                                  {user.isActive ? 'Deactivate' : 'Activate'}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => deleteUser.mutate(user.id)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card className="glass-morphism border-gold-accent/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Activity Logs</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityLogs.map((log: ActivityLog) => (
                    <div key={log.id} className="flex items-start space-x-4 p-4 border border-gold-accent/20 rounded-lg">
                      <div className="w-2 h-2 bg-gold-accent rounded-full mt-2"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{log.action}</h4>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{log.description}</p>
                        {log.user && (
                          <p className="text-xs text-muted-foreground mt-2">
                            by {log.user.firstName} {log.user.lastName} (@{log.user.username})
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>


        </Tabs>
      </div>
    </div>
  );
}