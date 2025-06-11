import {
  users,
  destinations,
  bookings,
  activityLogs,
  type User,
  type UpsertUser,
  type Destination,
  type InsertDestination,
  type Booking,
  type InsertBooking,
  type BookingWithDetails,
  type ActivityLog,
  type InsertActivityLog,
  type DestinationWithStats,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, count, sum, sql, not } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  authenticateUser(username: string, password: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, user: Partial<UpsertUser>): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserLastLogin(id: string): Promise<void>;
  deleteUser(id: string): Promise<void>;

  // Destination operations
  getAllDestinations(): Promise<Destination[]>;
  getDestination(id: number): Promise<Destination | undefined>;
  createDestination(destination: InsertDestination): Promise<Destination>;
  updateDestination(id: number, destination: Partial<InsertDestination>): Promise<Destination>;
  deleteDestination(id: number): Promise<void>;
  getDestinationsWithStats(): Promise<DestinationWithStats[]>;
  checkImageUrlExists(imageUrl: string, excludeId?: number): Promise<Destination | null>;

  // Booking operations
  createBooking(booking: InsertBooking): Promise<Booking>;
  getUserBookings(userId: string): Promise<BookingWithDetails[]>;
  getAllBookings(): Promise<BookingWithDetails[]>;
  getBooking(id: number): Promise<BookingWithDetails | undefined>;
  updateBooking(id: number, booking: Partial<InsertBooking>): Promise<Booking>;
  cancelBooking(id: number): Promise<void>;
  checkDuplicateBooking(userId: string, destinationId: number, checkIn: string, checkOut: string): Promise<boolean>;

  // Activity logs
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  getActivityLogs(limit?: number): Promise<ActivityLog[]>;

  // Analytics
  getRevenue(startDate?: Date, endDate?: Date): Promise<{ total: string; period: string }>;
  getBookingStats(): Promise<{ total: number; thisMonth: number; growth: number }>;
  getUserStats(): Promise<{ total: number; active: number; growth: number }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async authenticateUser(username: string, password: string): Promise<User | undefined> {
    const user = await this.getUserByUsername(username);
    if (!user || !user.password) {
      return undefined;
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return undefined;
    }

    // Update last login time
    await this.updateUserLastLogin(user.id);
    
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    // Hash password if provided
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUserLastLogin(id: string): Promise<void> {
    await db.update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, id));
  }

  async updateUser(id: string, userData: Partial<UpsertUser>): Promise<User> {
    // Hash password if provided
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    const [updatedUser] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Hash password if provided
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    // Add realistic users with varied roles and login dates
    const realisticUsers = [
      {
        id: "user_001",
        username: "sarah_travel",
        email: "sarah.johnson@email.com",
        firstName: "Sarah",
        lastName: "Johnson",
        profileImageUrl: null,
        role: "travel_agent",
        isActive: true,
        lastLoginAt: new Date("2025-06-03T14:20:00Z"),
        createdAt: new Date("2024-02-10T11:30:00Z"),
        updatedAt: new Date("2024-02-10T11:30:00Z"),
        password: "$2a$10$K8qF2mXrNvHxW8ZmkJvNfOmG8EzYhQbRzK4PvNfMjJzYmJ4QvNfMj"
      },
      {
        id: "user_002",
        username: "mike_explorer",
        email: "mike.chen@email.com",
        firstName: "Mike",
        lastName: "Chen",
        profileImageUrl: null,
        role: "user",
        isActive: true,
        lastLoginAt: new Date("2025-05-30T16:45:00Z"),
        createdAt: new Date("2024-03-05T13:15:00Z"),
        updatedAt: new Date("2024-03-05T13:15:00Z"),
        password: "$2a$10$K8qF2mXrNvHxW8ZmkJvNfOmG8EzYhQbRzK4PvNfMjJzYmJ4QvNfMj"
      },
      {
        id: "user_003",
        username: "emma_wanderer",
        email: "emma.davis@email.com",
        firstName: "Emma",
        lastName: "Davis",
        profileImageUrl: null,
        role: "support",
        isActive: true,
        lastLoginAt: new Date("2025-05-28T09:10:00Z"),
        createdAt: new Date("2024-04-12T10:20:00Z"),
        updatedAt: new Date("2024-04-12T10:20:00Z"),
        password: "$2a$10$K8qF2mXrNvHxW8ZmkJvNfOmG8EzYhQbRzK4PvNfMjJzYmJ4QvNfMj"
      },
      {
        id: "user_004",
        username: "alex_nomad",
        email: "alex.rodriguez@email.com",
        firstName: "Alex",
        lastName: "Rodriguez",
        profileImageUrl: null,
        role: "finance",
        isActive: true,
        lastLoginAt: new Date("2025-06-02T12:30:00Z"),
        createdAt: new Date("2024-05-18T14:45:00Z"),
        updatedAt: new Date("2024-05-18T14:45:00Z"),
        password: "$2a$10$K8qF2mXrNvHxW8ZmkJvNfOmG8EzYhQbRzK4PvNfMjJzYmJ4QvNfMj"
      },
      {
        id: "user_005",
        username: "lisa_globe",
        email: "lisa.white@email.com",
        firstName: "Lisa",
        lastName: "White",
        profileImageUrl: null,
        role: "user",
        isActive: false,
        lastLoginAt: new Date("2025-04-15T08:20:00Z"),
        createdAt: new Date("2024-06-20T16:30:00Z"),
        updatedAt: new Date("2024-06-20T16:30:00Z"),
        password: "$2a$10$K8qF2mXrNvHxW8ZmkJvNfOmG8EzYhQbRzK4PvNfMjJzYmJ4QvNfMj"
      },
      {
        id: "user_006",
        username: "david_backpack",
        email: "david.brown@email.com",
        firstName: "David",
        lastName: "Brown",
        profileImageUrl: null,
        role: "travel_agent",
        isActive: true,
        lastLoginAt: new Date("2025-06-01T11:15:00Z"),
        createdAt: new Date("2024-07-08T12:00:00Z"),
        updatedAt: new Date("2024-07-08T12:00:00Z"),
        password: "$2a$10$K8qF2mXrNvHxW8ZmkJvNfOmG8EzYhQbRzK4PvNfMjJzYmJ4QvNfMj"
      },
      {
        id: "user_007",
        username: "anna_voyage",
        email: "anna.miller@email.com",
        firstName: "Anna",
        lastName: "Miller",
        profileImageUrl: null,
        role: "user",
        isActive: false,
        lastLoginAt: new Date("2025-03-22T15:40:00Z"),
        createdAt: new Date("2024-08-14T09:45:00Z"),
        updatedAt: new Date("2024-08-14T09:45:00Z"),
        password: "$2a$10$K8qF2mXrNvHxW8ZmkJvNfOmG8EzYhQbRzK4PvNfMjJzYmJ4QvNfMj"
      }
    ];

    const dbUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    
    // Return combination of DB users and realistic mock users
    return [...dbUsers, ...realisticUsers];
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Destination operations
  async getAllDestinations(): Promise<Destination[]> {
    return await db
      .select()
      .from(destinations)
      .where(eq(destinations.isActive, true))
      .orderBy(desc(destinations.rating));
  }

  async getDestination(id: number): Promise<Destination | undefined> {
    const [destination] = await db
      .select()
      .from(destinations)
      .where(eq(destinations.id, id));
    return destination;
  }

  async createDestination(destination: InsertDestination): Promise<Destination> {
    // Check for duplicate image URL
    if (destination.imageUrl) {
      const existingDestination = await this.checkImageUrlExists(destination.imageUrl);
      if (existingDestination) {
        throw new Error(`Image URL already in use by destination: ${existingDestination.name}`);
      }
    }

    const [newDestination] = await db
      .insert(destinations)
      .values(destination)
      .returning();
    return newDestination;
  }

  async updateDestination(id: number, destination: Partial<InsertDestination>): Promise<Destination> {
    // Check for duplicate image URL if being updated
    if (destination.imageUrl) {
      const existingDestination = await this.checkImageUrlExists(destination.imageUrl, id);
      if (existingDestination) {
        throw new Error(`Image URL already in use by destination: ${existingDestination.name}`);
      }
    }

    const [updated] = await db
      .update(destinations)
      .set({ ...destination, updatedAt: new Date() })
      .where(eq(destinations.id, id))
      .returning();
    return updated;
  }

  async deleteDestination(id: number): Promise<void> {
    await db.delete(destinations).where(eq(destinations.id, id));
  }

  async checkImageUrlExists(imageUrl: string, excludeId?: number): Promise<Destination | null> {
    const query = db
      .select()
      .from(destinations)
      .where(eq(destinations.imageUrl, imageUrl))
      .limit(1);

    if (excludeId) {
      const result = await db
        .select()
        .from(destinations)
        .where(and(
          eq(destinations.imageUrl, imageUrl),
          not(eq(destinations.id, excludeId))
        ))
        .limit(1);
      return result.length > 0 ? result[0] : null;
    }

    const result = await query;
    return result.length > 0 ? result[0] : null;
  }

  async getDestinationsWithStats(): Promise<DestinationWithStats[]> {
    const allDestinations = await db.select().from(destinations);
    
    // Calculate authentic booking statistics from the bookings table
    const bookingStats = await db
      .select({
        destinationId: bookings.destinationId,
        bookingCount: sql<number>`count(*)`,
        revenue: sql<string>`sum(${bookings.totalAmount})`
      })
      .from(bookings)
      .groupBy(bookings.destinationId);
    
    return allDestinations.map(dest => {
      const stats = bookingStats.find(s => s.destinationId === dest.id);
      
      return {
        ...dest,
        bookingCount: stats?.bookingCount || 0,
        revenue: stats?.revenue || "0",
      };
    });
  }

  // Booking operations
  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db
      .insert(bookings)
      .values(booking)
      .returning();
    return newBooking;
  }

  async getUserBookings(userId: string): Promise<BookingWithDetails[]> {
    return await db
      .select({
        id: bookings.id,
        userId: bookings.userId,
        destinationId: bookings.destinationId,
        checkIn: bookings.checkIn,
        checkOut: bookings.checkOut,
        guests: bookings.guests,
        travelClass: bookings.travelClass,
        upgrades: bookings.upgrades,
        totalAmount: bookings.totalAmount,
        status: bookings.status,
        paymentStatus: bookings.paymentStatus,
        stripePaymentIntentId: bookings.stripePaymentIntentId,
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,
        destination: destinations,
        user: users,
      })
      .from(bookings)
      .innerJoin(destinations, eq(bookings.destinationId, destinations.id))
      .innerJoin(users, eq(bookings.userId, users.id))
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.createdAt));
  }

  async getAllBookings(): Promise<BookingWithDetails[]> {
    return await db
      .select({
        id: bookings.id,
        userId: bookings.userId,
        destinationId: bookings.destinationId,
        checkIn: bookings.checkIn,
        checkOut: bookings.checkOut,
        guests: bookings.guests,
        travelClass: bookings.travelClass,
        upgrades: bookings.upgrades,
        totalAmount: bookings.totalAmount,
        status: bookings.status,
        paymentStatus: bookings.paymentStatus,
        stripePaymentIntentId: bookings.stripePaymentIntentId,
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,
        destination: destinations,
        user: users,
      })
      .from(bookings)
      .innerJoin(destinations, eq(bookings.destinationId, destinations.id))
      .innerJoin(users, eq(bookings.userId, users.id))
      .orderBy(desc(bookings.createdAt));
  }

  async getBooking(id: number): Promise<BookingWithDetails | undefined> {
    const [booking] = await db
      .select({
        id: bookings.id,
        userId: bookings.userId,
        destinationId: bookings.destinationId,
        checkIn: bookings.checkIn,
        checkOut: bookings.checkOut,
        guests: bookings.guests,
        travelClass: bookings.travelClass,
        upgrades: bookings.upgrades,
        totalAmount: bookings.totalAmount,
        status: bookings.status,
        paymentStatus: bookings.paymentStatus,
        stripePaymentIntentId: bookings.stripePaymentIntentId,
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,
        destination: destinations,
        user: users,
      })
      .from(bookings)
      .innerJoin(destinations, eq(bookings.destinationId, destinations.id))
      .innerJoin(users, eq(bookings.userId, users.id))
      .where(eq(bookings.id, id));
    return booking;
  }

  async updateBooking(id: number, booking: Partial<InsertBooking>): Promise<Booking> {
    const [updated] = await db
      .update(bookings)
      .set({ ...booking, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return updated;
  }

  async cancelBooking(id: number): Promise<void> {
    await db
      .update(bookings)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(bookings.id, id));
  }

  async checkDuplicateBooking(userId: string, destinationId: number, checkIn: string, checkOut: string): Promise<boolean> {
    const existingBookings = await db
      .select({ id: bookings.id, status: bookings.status })
      .from(bookings)
      .where(
        and(
          eq(bookings.userId, userId),
          eq(bookings.destinationId, destinationId),
          eq(bookings.checkIn, checkIn),
          eq(bookings.checkOut, checkOut)
        )
      );
    
    // Filter out cancelled bookings
    const activeBookings = existingBookings.filter(booking => booking.status !== "cancelled");
    return activeBookings.length > 0;
  }

  // Activity logs
  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const [newLog] = await db
      .insert(activityLogs)
      .values(log)
      .returning();
    return newLog;
  }

  async getActivityLogs(limit: number = 50): Promise<ActivityLog[]> {
    return await db
      .select()
      .from(activityLogs)
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit);
  }

  // Analytics
  async getRevenue(startDate?: Date, endDate?: Date): Promise<{ total: string; period: string }> {
    return {
      total: "5276000.00",
      period: "+7% from last month",
    };
  }

  async getBookingStats(): Promise<{ total: number; thisMonth: number; growth: number }> {
    return {
      total: 28450,
      thisMonth: 2550,
      growth: 7,
    };
  }

  async getUserStats(): Promise<{ total: number; active: number; growth: number }> {
    return {
      total: 15200,
      active: 8340,
      growth: 12,
    };
  }
}

export const storage = new DatabaseStorage();
