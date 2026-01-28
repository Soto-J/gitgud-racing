import { nanoid } from "nanoid";

import {
  mysqlTable,
  varchar,
  text,
  timestamp,
  boolean,
} from "drizzle-orm/mysql-core";

import { user as userTable } from "@/db/schemas/auth";

export const profileTable = mysqlTable("profile", {
  id: varchar("id", { length: 21 })
    .primaryKey()
    .$default(() => nanoid())
    .notNull(),
  userId: varchar("user_id", { length: 36 })
    .references(() => userTable.id, { onDelete: "cascade" })
    .unique()
    .notNull(),

  isActive: boolean("is_active").notNull().default(false),

  discord: varchar("discord", { length: 37 }).default(""),
  team: varchar("team", { length: 20 }).default(""),
  bio: text("bio").default(""),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
