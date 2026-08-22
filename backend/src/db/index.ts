import { env } from "../config/env.js";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema/index.js";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

// Passing the schema enables the db.query relational API
export const db = drizzle(pool, { schema });
