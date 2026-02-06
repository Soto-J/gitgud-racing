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

  isActive: boolean("is_active").default(false).notNull(),

  discord: varchar("discord", { length: 37 }),
  team: varchar("team", { length: 20 }),
  bio: text("bio"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
