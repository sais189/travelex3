import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Use the external database connection string
const DATABASE_URL = "postgresql://database_hdlg_user:LzOKtr2z1Csa1Unr9WcafXyPbQ7QokBR@dpg-d17eed0dl3ps73acek2g-a.singapore-postgres.render.com/database_hdlg";

export const pool = new Pool({ 
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export const db = drizzle(pool, { schema });