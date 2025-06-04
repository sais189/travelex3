import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { storage } from "./storage";
import { insertDestinationSchema, insertBookingSchema } from "@shared/schema";
import { z } from "zod";
import Stripe from "stripe";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

// Validation schemas
const createBookingSchema = insertBookingSchema.extend({
  checkIn: z.string().transform((val) => new Date(val).toISOString().split('T')[0]),
  checkOut: z.string().transform((val) => new Date(val).toISOString().split('T')[0]),
  totalAmount: z.number().transform((val) => val.toString()),
}).omit({
  userId: true, // We'll add this from the authenticated user
});

const updateDestinationSchema = insertDestinationSchema.partial();

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const user = await storage.getUser(userId);
      
      // Check if user should have admin role based on email
      if (user && user.email === 'admins@globetrotter.com') {
        const updatedUser = await storage.upsertUser({
          ...user,
          role: 'admin'
        });
        res.json(updatedUser);
      } else {
        res.json(user);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Username/Password login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const user = await storage.authenticateUser(username, password);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set session
      (req as any).session.user = user;
      
      res.json({ user, message: "Login successful" });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Username/Password signup
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { username, email, firstName, lastName, password } = req.body;
      
      if (!username || !email || !firstName || !lastName || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }

      // Create new user
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newUser = await storage.createUser({
        id: userId,
        username,
        email,
        firstName,
        lastName,
        password,
        role: 'user',
        isActive: true
      });

      // Set session
      (req as any).session.user = newUser;
      
      res.status(201).json({ user: newUser, message: "Account created successfully" });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Account creation failed" });
    }
  });

  // Get current user for session-based auth
  app.get('/api/auth/session', async (req, res) => {
    try {
      const sessionUser = (req as any).session?.user;
      if (sessionUser) {
        const user = await storage.getUser(sessionUser.id);
        res.json(user);
      } else {
        res.status(401).json({ message: "Not authenticated" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to get session" });
    }
  });

  // Logout
  app.post('/api/auth/logout', (req, res) => {
    (req as any).session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  // Admin routes
  app.get('/api/admin/analytics', async (req, res) => {
    try {
      const sessionUser = (req as any).session?.user;
      if (!sessionUser || sessionUser.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const [revenue, bookingStats, userStats] = await Promise.all([
        storage.getRevenue(),
        storage.getBookingStats(),
        storage.getUserStats()
      ]);

      res.json({
        revenue,
        bookings: bookingStats,
        users: userStats
      });
    } catch (error) {
      console.error("Analytics error:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.get('/api/admin/destinations', async (req, res) => {
    try {
      const sessionUser = (req as any).session?.user;
      if (!sessionUser || sessionUser.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const destinations = await storage.getDestinationsWithStats();
      res.json(destinations);
    } catch (error) {
      console.error("Destinations with stats error:", error);
      res.status(500).json({ message: "Failed to fetch destinations" });
    }
  });

  app.get('/api/admin/users', async (req, res) => {
    try {
      const sessionUser = (req as any).session?.user;
      if (!sessionUser || sessionUser.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Users fetch error:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/admin/activity-logs', async (req, res) => {
    try {
      const sessionUser = (req as any).session?.user;
      if (!sessionUser || sessionUser.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const logs = await storage.getActivityLogs(100);
      res.json(logs);
    } catch (error) {
      console.error("Activity logs error:", error);
      res.status(500).json({ message: "Failed to fetch activity logs" });
    }
  });

  app.patch('/api/admin/users/:id/toggle-status', async (req, res) => {
    try {
      const sessionUser = (req as any).session?.user;
      if (!sessionUser || sessionUser.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const updatedUser = await storage.upsertUser({
        ...user,
        isActive: !user.isActive
      });

      // Log the activity
      await storage.createActivityLog({
        userId: sessionUser.id,
        action: `User ${updatedUser.isActive ? 'Activated' : 'Deactivated'}`,
        description: `Changed status of user ${user.username} to ${updatedUser.isActive ? 'active' : 'inactive'}`
      });

      res.json(updatedUser);
    } catch (error) {
      console.error("Toggle user status error:", error);
      res.status(500).json({ message: "Failed to update user status" });
    }
  });

  app.post('/api/admin/users', async (req, res) => {
    try {
      const sessionUser = (req as any).session?.user;
      if (!sessionUser || sessionUser.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { username, email, firstName, lastName, role, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ message: "Username, email, and password are required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }

      const newUser = await storage.createUser({
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        username,
        email,
        firstName,
        lastName,
        role: role || 'user',
        password,
        isActive: true
      });

      // Log the activity
      await storage.createActivityLog({
        userId: sessionUser.id,
        action: 'User Created',
        description: `Created new user ${username} with role ${role || 'user'}`
      });

      res.status(201).json(newUser);
    } catch (error) {
      console.error("Create user error:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.delete('/api/admin/users/:id', async (req, res) => {
    try {
      const sessionUser = (req as any).session?.user;
      if (!sessionUser || sessionUser.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      await storage.deleteUser(id);

      // Log the activity
      await storage.createActivityLog({
        userId: sessionUser.id,
        action: 'User Deleted',
        description: `Deleted user ${user.username} (${user.email})`
      });

      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Destinations routes
  app.get('/api/destinations', async (req, res) => {
    try {
      const destinations = await storage.getAllDestinations();
      res.json(destinations);
    } catch (error) {
      console.error("Error fetching destinations:", error);
      res.status(500).json({ message: "Failed to fetch destinations" });
    }
  });

  app.get('/api/destinations/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const destination = await storage.getDestination(id);
      if (!destination) {
        return res.status(404).json({ message: "Destination not found" });
      }
      res.json(destination);
    } catch (error) {
      console.error("Error fetching destination:", error);
      res.status(500).json({ message: "Failed to fetch destination" });
    }
  });

  // Admin routes - destinations management
  app.post('/api/admin/destinations', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validatedData = insertDestinationSchema.parse(req.body);
      const destination = await storage.createDestination(validatedData);
      
      await storage.createActivityLog({
        userId: req.user.claims.sub,
        action: "destination_created",
        description: `Created destination: ${destination.name}`,
        metadata: { destinationId: destination.id },
      });

      res.json(destination);
    } catch (error) {
      console.error("Error creating destination:", error);
      res.status(500).json({ message: "Failed to create destination" });
    }
  });

  app.put('/api/admin/destinations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      const validatedData = updateDestinationSchema.parse(req.body);
      const destination = await storage.updateDestination(id, validatedData);
      
      await storage.createActivityLog({
        userId: req.user.claims.sub,
        action: "destination_updated",
        description: `Updated destination: ${destination.name}`,
        metadata: { destinationId: destination.id },
      });

      res.json(destination);
    } catch (error) {
      console.error("Error updating destination:", error);
      res.status(500).json({ message: "Failed to update destination" });
    }
  });

  app.delete('/api/admin/destinations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      await storage.deleteDestination(id);
      
      await storage.createActivityLog({
        userId: req.user.claims.sub,
        action: "destination_deleted",
        description: `Deleted destination with ID: ${id}`,
        metadata: { destinationId: id },
      });

      res.json({ message: "Destination deleted successfully" });
    } catch (error) {
      console.error("Error deleting destination:", error);
      res.status(500).json({ message: "Failed to delete destination" });
    }
  });

  app.get('/api/admin/destinations', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const destinations = await storage.getDestinationsWithStats();
      res.json(destinations);
    } catch (error) {
      console.error("Error fetching destinations with stats:", error);
      res.status(500).json({ message: "Failed to fetch destinations" });
    }
  });

  // Admin routes - users management
  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.delete('/api/admin/users/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const userId = req.params.id;
      await storage.deleteUser(userId);
      
      await storage.createActivityLog({
        userId: req.user.claims.sub,
        action: "user_deleted",
        description: `Deleted user: ${userId}`,
        metadata: { deletedUserId: userId },
      });

      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Admin routes - analytics
  app.get('/api/admin/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const [revenue, bookingStats, userStats] = await Promise.all([
        storage.getRevenue(),
        storage.getBookingStats(),
        storage.getUserStats(),
      ]);

      res.json({
        revenue,
        bookings: bookingStats,
        users: userStats,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Admin routes - activity logs
  app.get('/api/admin/logs', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const limit = parseInt(req.query.limit as string) || 50;
      const logs = await storage.getActivityLogs(limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      res.status(500).json({ message: "Failed to fetch activity logs" });
    }
  });

  // Bookings routes
  app.post('/api/bookings', async (req: any, res) => {
    try {
      // Check both session-based and Replit auth
      const sessionUser = req.session?.user;
      const replitUser = req.user?.claims?.sub;
      const userId = sessionUser?.id || replitUser;
      
      if (!userId) {
        console.log("Auth debug - sessionUser:", sessionUser);
        console.log("Auth debug - replitUser:", replitUser);
        console.log("Auth debug - req.user:", req.user);
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      console.log("Creating booking with userId:", userId);
      console.log("Request body:", req.body);
      
      const validatedData = createBookingSchema.parse(req.body);
      console.log("Validated data:", validatedData);
      
      const booking = await storage.createBooking({
        ...validatedData,
        userId,
      });

      await storage.createActivityLog({
        userId,
        action: "booking_created",
        description: `Created booking for destination ID: ${booking.destinationId}`,
        metadata: { bookingId: booking.id },
      });

      res.json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.get('/api/bookings', async (req: any, res) => {
    try {
      const sessionUser = req.session?.user;
      const replitUser = req.user?.claims?.sub;
      const userId = sessionUser?.id || replitUser;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const bookings = await storage.getUserBookings(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get('/api/bookings/:id', async (req: any, res) => {
    try {
      // Check both session-based and Replit auth
      const sessionUser = req.session?.user;
      const replitUser = req.user?.claims?.sub;
      const userId = sessionUser?.id || replitUser;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      const booking = await storage.getBooking(id);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Check if user owns this booking or is admin
      const user = await storage.getUser(userId);
      if (booking.userId !== userId && user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(booking);
    } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  });

  app.put('/api/bookings/:id/cancel', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const booking = await storage.getBooking(id);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Check if user owns this booking
      if (booking.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.cancelBooking(id);
      
      await storage.createActivityLog({
        userId: req.user.claims.sub,
        action: "booking_cancelled",
        description: `Cancelled booking ID: ${id}`,
        metadata: { bookingId: id },
      });

      res.json({ message: "Booking cancelled successfully" });
    } catch (error) {
      console.error("Error cancelling booking:", error);
      res.status(500).json({ message: "Failed to cancel booking" });
    }
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", async (req: any, res) => {
    try {
      const sessionUser = req.session?.user;
      const replitUser = req.user?.claims?.sub;
      const userId = sessionUser?.id || replitUser;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { amount, bookingId } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          bookingId: bookingId?.toString() || "",
          userId,
        },
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  app.post("/api/confirm-payment", async (req: any, res) => {
    try {
      const sessionUser = req.session?.user;
      const replitUser = req.user?.claims?.sub;
      const userId = sessionUser?.id || replitUser;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { paymentIntentId, bookingId } = req.body;
      
      // Verify payment with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === "succeeded") {
        // Update booking payment status
        await storage.updateBooking(bookingId, {
          paymentStatus: "paid",
          status: "confirmed",
          stripePaymentIntentId: paymentIntentId,
        });

        await storage.createActivityLog({
          userId,
          action: "payment_completed",
          description: `Payment completed for booking ID: ${bookingId}`,
          metadata: { bookingId, paymentIntentId },
        });

        res.json({ message: "Payment confirmed successfully" });
      } else {
        res.status(400).json({ message: "Payment not successful" });
      }
    } catch (error: any) {
      console.error("Error confirming payment:", error);
      res.status(500).json({ message: "Error confirming payment: " + error.message });
    }
  });

  // Admin bookings route
  app.get('/api/admin/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const bookings = await storage.getAllBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching all bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
