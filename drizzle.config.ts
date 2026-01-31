import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import env from "@/env";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schemas/index.ts",
  dialect: "mysql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
