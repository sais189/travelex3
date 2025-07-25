import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  username: varchar("username").unique(),
  email: varchar("email").unique(),
  password: varchar("password"), // hashed password for username/password login
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("user"), // user, admin
  lastLoginAt: timestamp("last_login_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Destinations table
export const destinations = pgTable("destinations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  country: varchar("country", { length: 255 }).notNull(),
  description: text("description").notNull(),
  shortDescription: varchar("short_description", { length: 500 }),
  imageUrl: varchar("image_url", { length: 500 }).unique(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }), // for showing discounts
  discountPercentage: integer("discount_percentage").default(0), // discount percentage
  promoTag: varchar("promo_tag", { length: 50 }), // 'Best Offer', 'On Sale', 'Limited Time', etc.
  promoExpiry: timestamp("promo_expiry"), // when the promotion expires
  discountType: varchar("discount_type", { length: 30 }).default("percentage"), // percentage, fixed, bogo, group
  seasonalTag: varchar("seasonal_tag", { length: 50 }), // 'Summer Special', 'Holiday Deal', 'Black Friday', etc.
  flashSale: boolean("flash_sale").default(false), // for time-sensitive flash sales
  flashSaleEnd: timestamp("flash_sale_end"), // when flash sale ends
  couponCode: varchar("coupon_code", { length: 20 }), // unique coupon code for the destination
  groupDiscountMin: integer("group_discount_min").default(0), // minimum group size for group discount
  loyaltyDiscount: integer("loyalty_discount").default(0), // additional discount for returning customers
  bundleDeal: jsonb("bundle_deal"), // bundle offer details
  duration: integer("duration").notNull(), // in days
  distanceKm: decimal("distance_km", { precision: 8, scale: 2 }), // distance in kilometers
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").default(0),
  maxGuests: integer("max_guests").default(2),
  isActive: boolean("is_active").default(true),
  features: jsonb("features"), // array of included features
  itinerary: jsonb("itinerary"), // day by day itinerary
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bookings table
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  destinationId: integer("destination_id")
    .notNull()
    .references(() => destinations.id),
  checkIn: date("check_in").notNull(),
  checkOut: date("check_out").notNull(),
  guests: integer("guests").notNull(),
  travelClass: varchar("travel_class", { length: 50 }).default("economy"), // economy, business
  upgrades: jsonb("upgrades"), // array of selected upgrades
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  originalAmount: decimal("original_amount", { precision: 10, scale: 2 }), // before coupon discount
  appliedCouponCode: varchar("applied_coupon_code", { length: 20 }), // coupon code used
  couponDiscount: decimal("coupon_discount", { precision: 10, scale: 2 }).default("0"), // discount amount from coupon
  status: varchar("status", { length: 50 }).default("pending"), // pending, confirmed, cancelled, completed
  paymentStatus: varchar("payment_status", { length: 50 }).default("pending"), // pending, paid, failed, refunded
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  destinationId: integer("destination_id")
    .notNull()
    .references(() => destinations.id),
  userId: varchar("user_id").references(() => users.id),
  rating: integer("rating").notNull(), // 1-5 stars
  title: varchar("title", { length: 255 }).notNull(),
  comment: text("comment").notNull(),
  tripDate: date("trip_date"), // when they took the trip
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Activity logs table
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  action: varchar("action", { length: 255 }).notNull(),
  description: text("description"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
  activityLogs: many(activityLogs),
}));

export const destinationsRelations = relations(destinations, ({ many }) => ({
  bookings: many(bookings),
  reviews: many(reviews),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  destination: one(destinations, {
    fields: [bookings.destinationId],
    references: [destinations.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  destination: one(destinations, {
    fields: [reviews.destinationId],
    references: [destinations.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertDestinationSchema = createInsertSchema(destinations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Destination = typeof destinations.$inferSelect;
export type InsertDestination = z.infer<typeof insertDestinationSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;

// Extended types for API responses
export type BookingWithDetails = Booking & {
  destination: Destination;
  user: User;
};

export type DestinationWithStats = Destination & {
  bookingCount?: number;
  revenue?: string;
};

export type ReviewWithUser = Review & {
  user: User;
};
