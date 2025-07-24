import "dotenv/config";

import { drizzle } from "drizzle-orm/mysql2";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("Database url not found!");
}

export const db = drizzle(DATABASE_URL);
