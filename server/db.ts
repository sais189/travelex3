import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Use the external database connection string
const DATABASE_URL = "postgresql://travelex1_user:hC62HuqVKRb4hH3Bkuz5kgDfGtDehMwO@dpg-d17g0oumcj7s73d61u00-a.singapore-postgres.render.com/travelex1";

export const pool = new Pool({ 
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export const db = drizzle(pool, { schema });