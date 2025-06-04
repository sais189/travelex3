import { UpsertUser } from "../shared/schema";

export const mockUsers: UpsertUser[] = [
  {
    id: "admin_user",
    username: "admin",
    email: "admin@travelapp.com",
    firstName: "Admin",
    lastName: "User",
    role: "admin",
    isActive: true,
    lastLoginAt: new Date("2025-06-04T10:30:00Z"),
    createdAt: new Date("2024-01-15T09:00:00Z"),
    password: "$2a$10$K8qF2mXrNvHxW8ZmkJvNfOmG8EzYhQbRzK4PvNfMjJzYmJ4QvNfMj" // hashed "admin123"
  },
  {
    id: "user_001",
    username: "sarah_travel",
    email: "sarah.johnson@email.com",
    firstName: "Sarah",
    lastName: "Johnson",
    role: "travel_agent",
    isActive: true,
    lastLoginAt: new Date("2025-06-03T14:20:00Z"),
    createdAt: new Date("2024-02-10T11:30:00Z"),
    password: "$2a$10$K8qF2mXrNvHxW8ZmkJvNfOmG8EzYhQbRzK4PvNfMjJzYmJ4QvNfMj"
  },
  {
    id: "user_002",
    username: "mike_explorer",
    email: "mike.chen@email.com",
    firstName: "Mike",
    lastName: "Chen",
    role: "user",
    isActive: true,
    lastLoginAt: new Date("2025-05-30T16:45:00Z"),
    createdAt: new Date("2024-03-05T13:15:00Z"),
    password: "$2a$10$K8qF2mXrNvHxW8ZmkJvNfOmG8EzYhQbRzK4PvNfMjJzYmJ4QvNfMj"
  },
  {
    id: "user_003",
    username: "emma_wanderer",
    email: "emma.davis@email.com",
    firstName: "Emma",
    lastName: "Davis",
    role: "support",
    isActive: true,
    lastLoginAt: new Date("2025-05-28T09:10:00Z"),
    createdAt: new Date("2024-04-12T10:20:00Z"),
    password: "$2a$10$K8qF2mXrNvHxW8ZmkJvNfOmG8EzYhQbRzK4PvNfMjJzYmJ4QvNfMj"
  },
  {
    id: "user_004",
    username: "alex_nomad",
    email: "alex.rodriguez@email.com",
    firstName: "Alex",
    lastName: "Rodriguez",
    role: "finance",
    isActive: true,
    lastLoginAt: new Date("2025-06-02T12:30:00Z"),
    createdAt: new Date("2024-05-18T14:45:00Z"),
    password: "$2a$10$K8qF2mXrNvHxW8ZmkJvNfOmG8EzYhQbRzK4PvNfMjJzYmJ4QvNfMj"
  },
  {
    id: "user_005",
    username: "lisa_globe",
    email: "lisa.white@email.com",
    firstName: "Lisa",
    lastName: "White",
    role: "user",
    isActive: false,
    lastLoginAt: new Date("2025-04-15T08:20:00Z"),
    createdAt: new Date("2024-06-20T16:30:00Z"),
    password: "$2a$10$K8qF2mXrNvHxW8ZmkJvNfOmG8EzYhQbRzK4PvNfMjJzYmJ4QvNfMj"
  },
  {
    id: "user_006",
    username: "david_backpack",
    email: "david.brown@email.com",
    firstName: "David",
    lastName: "Brown",
    role: "travel_agent",
    isActive: true,
    lastLoginAt: new Date("2025-06-01T11:15:00Z"),
    createdAt: new Date("2024-07-08T12:00:00Z"),
    password: "$2a$10$K8qF2mXrNvHxW8ZmkJvNfOmG8EzYhQbRzK4PvNfMjJzYmJ4QvNfMj"
  },
  {
    id: "user_007",
    username: "anna_voyage",
    email: "anna.miller@email.com",
    firstName: "Anna",
    lastName: "Miller",
    role: "user",
    isActive: false,
    lastLoginAt: new Date("2025-03-22T15:40:00Z"),
    createdAt: new Date("2024-08-14T09:45:00Z"),
    password: "$2a$10$K8qF2mXrNvHxW8ZmkJvNfOmG8EzYhQbRzK4PvNfMjJzYmJ4QvNfMj"
  },
  {
    id: "user_008",
    username: "james_adventure",
    email: "james.wilson@email.com",
    firstName: "James",
    lastName: "Wilson",
    role: "support",
    isActive: true,
    lastLoginAt: new Date("2025-05-25T13:50:00Z"),
    createdAt: new Date("2024-09-30T11:20:00Z"),
    password: "$2a$10$K8qF2mXrNvHxW8ZmkJvNfOmG8EzYhQbRzK4PvNfMjJzYmJ4QvNfMj"
  },
  {
    id: "user_009",
    username: "maria_journey",
    email: "maria.garcia@email.com",
    firstName: "Maria",
    lastName: "Garcia",
    role: "finance",
    isActive: true,
    lastLoginAt: new Date("2025-06-03T17:25:00Z"),
    createdAt: new Date("2024-10-15T14:10:00Z"),
    password: "$2a$10$K8qF2mXrNvHxW8ZmkJvNfOmG8EzYhQbRzK4PvNfMjJzYmJ4QvNfMj"
  }
];