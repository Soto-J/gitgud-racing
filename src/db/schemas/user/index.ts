import { nanoid } from "nanoid";

import {
  mysqlTable,
  varchar,
  text,
  timestamp,
  boolean,
  mysqlEnum,
  int,
  decimal,
} from "drizzle-orm/mysql-core";

export const roles = ["admin", "staff", "user", "guest"] as const;

export const user = mysqlTable("user", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: text("name").notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),

  // admin plugin attributes
  role: mysqlEnum("role", roles).notNull().default("user"),
  banned: boolean("banned"),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const profileTable = mysqlTable("profile", {
  id: varchar("id", { length: 21 })
    .notNull()
    .primaryKey()
    .$default(() => nanoid()),
  userId: varchar("user_id", { length: 36 })
    .references(() => user.id, { onDelete: "cascade" })
    .unique()
    .notNull(),

  iracingId: varchar("iracing_id", { length: 10 }).unique(),
  isActive: boolean("is_active").notNull().default(false),

  discord: varchar("discord", { length: 37 }).default(""),
  team: varchar("team", { length: 20 }).default(""),
  bio: text("bio").default(""),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const safetyClassValues = ["A", "B", "C", "D", "R"] as const;

export const licenseTable = mysqlTable("license", {
  id: varchar("id", { length: 21 })
    .primaryKey()
    .$default(() => nanoid())
    .notNull(),
  userId: varchar("user_id", { length: 36 })
    .references(() => user.id, { onDelete: "cascade" })
    .unique()
    .notNull(),

  ovalIRating: int("oval_i_rating").notNull(),
  ovalSafetyRating: decimal("oval_safety_rating", {
    precision: 4,
    scale: 2,
  }).notNull(),
  ovalLicenseClass: mysqlEnum("oval_license_class", safetyClassValues)
    .default("R")
    .notNull(),

  sportsCarIRating: int("sports_car_i_rating").notNull(),
  sportsCarSafetyRating: decimal("sports_car_safety_rating", {
    precision: 4,
    scale: 2,
  }).notNull(),
  sportsCarLicenseClass: mysqlEnum("sports_license_class", safetyClassValues)
    .default("R")
    .notNull(),

  formulaCarIRating: int("formula_car_i_rating").notNull(),
  formulaCarSafetyRating: decimal("formula_car_safety_rating", {
    precision: 4,
    scale: 2,
  }).notNull(),
  formulaCarLicenseClass: mysqlEnum("formula_license_class", safetyClassValues)
    .default("R")
    .notNull(),

  dirtOvalIRating: int("dirt_oval_i_rating").default(0).notNull(),
  dirtOvalSafetyRating: decimal("dirt_oval_safety_rating", {
    precision: 4,
    scale: 2,
  }).notNull(),
  dirtOvalLicenseClass: mysqlEnum("dirt_oval_license_class", safetyClassValues)
    .default("R")
    .notNull(),

  dirtRoadIRating: int("dirt_road_i_rating").default(0).notNull(),
  dirtRoadSafetyRating: decimal("dirt_road_safety_rating", {
    precision: 4,
    scale: 2,
  }).notNull(),
  dirtRoadLicenseClass: mysqlEnum("dirt_road_license_class", safetyClassValues)
    .default("R")
    .notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});