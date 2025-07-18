import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Use the user's Render database connection string
const DATABASE_URL = "postgresql://sai_j16q_user:Ktz9XhfvegcunhDBccYng71gUSfvoFvY@dpg-d1ss8amr433s73emf0l0-a.singapore-postgres.render.com/sai_j16q?sslmode=require";

export const pool = new Pool({ 
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export const db = drizzle(pool, { schema });