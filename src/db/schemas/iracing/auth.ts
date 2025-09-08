import { nanoid } from "nanoid";

import {
  mysqlTable,
  varchar,
  text,
  timestamp,
} from "drizzle-orm/mysql-core";

import { user } from "@/db/schemas/user";

export const iracingAuthTable = mysqlTable("iracing_auth", {
  id: varchar("id", { length: 21 })
    .primaryKey()
    .$default(() => nanoid()),
  userId: varchar("user_id", { length: 36 })
    .references(() => user.id)
    .unique()
    .notNull(),

  authCode: text("auth_code").notNull(),

  expiresAt: timestamp("expires_at").notNull(), // createdAt + 1 hour
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});