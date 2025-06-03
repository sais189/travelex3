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
import { eq, desc, and, gte, lte, count, sum, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  authenticateUser(username: string, password: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
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

  // Booking operations
  createBooking(booking: InsertBooking): Promise<Booking>;
  getUserBookings(userId: string): Promise<BookingWithDetails[]>;
  getAllBookings(): Promise<BookingWithDetails[]>;
  getBooking(id: number): Promise<BookingWithDetails | undefined>;
  updateBooking(id: number, booking: Partial<InsertBooking>): Promise<Booking>;
  cancelBooking(id: number): Promise<void>;

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
    return await db.select().from(users).orderBy(desc(users.createdAt));
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
    const [newDestination] = await db
      .insert(destinations)
      .values(destination)
      .returning();
    return newDestination;
  }

  async updateDestination(id: number, destination: Partial<InsertDestination>): Promise<Destination> {
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

  async getDestinationsWithStats(): Promise<DestinationWithStats[]> {
    const result = await db
      .select({
        destination: destinations,
        bookingCount: count(bookings.id),
        revenue: sum(bookings.totalAmount),
      })
      .from(destinations)
      .leftJoin(bookings, eq(destinations.id, bookings.destinationId))
      .groupBy(destinations.id)
      .orderBy(desc(count(bookings.id)));

    return result.map(row => ({
      ...row.destination,
      bookingCount: row.bookingCount,
      revenue: row.revenue || "0",
    }));
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
    let query = db
      .select({ total: sum(bookings.totalAmount) })
      .from(bookings)
      .where(eq(bookings.paymentStatus, "paid"));

    if (startDate && endDate) {
      query = query.where(
        and(
          gte(bookings.createdAt, startDate),
          lte(bookings.createdAt, endDate)
        )
      );
    }

    const [result] = await query;
    return {
      total: result.total || "0",
      period: startDate && endDate ? "custom" : "all-time",
    };
  }

  async getBookingStats(): Promise<{ total: number; thisMonth: number; growth: number }> {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const [totalResult] = await db
      .select({ count: count() })
      .from(bookings);

    const [thisMonthResult] = await db
      .select({ count: count() })
      .from(bookings)
      .where(gte(bookings.createdAt, thisMonthStart));

    const [lastMonthResult] = await db
      .select({ count: count() })
      .from(bookings)
      .where(
        and(
          gte(bookings.createdAt, lastMonthStart),
          lte(bookings.createdAt, lastMonthEnd)
        )
      );

    const growth = lastMonthResult.count > 0 
      ? ((thisMonthResult.count - lastMonthResult.count) / lastMonthResult.count) * 100
      : 0;

    return {
      total: totalResult.count,
      thisMonth: thisMonthResult.count,
      growth: Math.round(growth),
    };
  }

  async getUserStats(): Promise<{ total: number; active: number; growth: number }> {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const [totalResult] = await db
      .select({ count: count() })
      .from(users);

    const [thisMonthResult] = await db
      .select({ count: count() })
      .from(users)
      .where(gte(users.createdAt, thisMonthStart));

    const [lastMonthResult] = await db
      .select({ count: count() })
      .from(users)
      .where(
        and(
          gte(users.createdAt, lastMonthStart),
          lte(users.createdAt, lastMonthEnd)
        )
      );

    const growth = lastMonthResult.count > 0 
      ? ((thisMonthResult.count - lastMonthResult.count) / lastMonthResult.count) * 100
      : 0;

    return {
      total: totalResult.count,
      active: totalResult.count, // For now, all users are considered active
      growth: Math.round(growth),
    };
  }
}

export const storage = new DatabaseStorage();
