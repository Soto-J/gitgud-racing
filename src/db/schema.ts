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

export const user = mysqlTable("user", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: text("name").notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),

  // admin plugin attributes
  role: mysqlEnum("role", ["admin", "member"]).notNull().default("member"),
  banned: boolean("banned"),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),

  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = mysqlTable("session", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  token: varchar("token", { length: 255 }).notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),

  impersonatedBy: text("impersonated_by"),

  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const account = mysqlTable("account", {
  id: varchar("id", { length: 36 }).primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  scope: text("scope"),
  password: text("password"),
  idToken: text("id_token"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),

  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),

  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = mysqlTable("verification", {
  id: varchar("id", { length: 36 }).primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),

  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
});

export const profileTable = mysqlTable("profile", {
  id: varchar("id", { length: 21 })
    .notNull()
    .primaryKey()
    .$default(() => nanoid()),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),

  iracingId: varchar("iracing_id", { length: 10 }).unique(),
  isActive: boolean("is_active").notNull().default(false),

  discord: varchar("discord", { length: 37 }).default(""),
  team: varchar("team", { length: 20 }).default(""),
  bio: text("bio").default(""),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// iRacing
export const iracingAuthTable = mysqlTable("iracing_auth", {
  id: varchar("id", { length: 21 })
    .primaryKey()
    .$default(() => nanoid()),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),

  authCode: text("auth_code").notNull(),

  ssoCookieValue: text("sso_cookie_value"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  expiresAt: timestamp("expires_at"), // createdAt + 1 hour
});

export const safetyClassValues = ["A", "B", "C", "D", "R"] as const;

export const licenseTable = mysqlTable("license", {
  id: varchar("id", { length: 21 })
    .notNull()
    .primaryKey()
    .$default(() => nanoid()),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),

  ovalIRating: int("oval_i_rating"),
  ovalSafetyRating: decimal("oval_safety_rating", { precision: 4, scale: 2 }),
  ovalLicenseClass: mysqlEnum("oval_license_class", safetyClassValues)
    .notNull()
    .default("R"),

  sportsCarIRating: int("sports_car_i_rating"),
  sportsCarSafetyRating: decimal("sports_car_safety_rating", {
    precision: 4,
    scale: 2,
  }),
  sportsCarLicenseClass: mysqlEnum("sports_license_class", safetyClassValues)
    .notNull()
    .default("R"),

  formulaCarIRating: int("formula_car_i_rating"),
  formulaCarSafetyRating: decimal("formula_car_safety_rating", {
    precision: 4,
    scale: 2,
  }),
  formulaCarLicenseClass: mysqlEnum("formula_license_class", safetyClassValues)
    .notNull()
    .default("R"),

  dirtOvalIRating: int("dirt_oval_i_rating"),
  dirtOvalSafetyRating: decimal("dirt_oval_safety_rating", {
    precision: 4,
    scale: 2,
  }),
  dirtOvalLicenseClass: mysqlEnum("dirt_oval_license_class", safetyClassValues)
    .notNull()
    .default("R"),

  dirtRoadIRating: int("dirt_road_i_rating"),
  dirtRoadSafetyRating: decimal("dirt_road_safety_rating", {
    precision: 4,
    scale: 2,
  }),
  dirtRoadLicenseClass: mysqlEnum("dirt_road_license_class", safetyClassValues)
    .notNull()
    .default("R"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const seriesTable = mysqlTable("series", {
  seriesId: varchar("series_id", { length: 36 }).primaryKey().notNull(),

  category: varchar("category", { length: 25 }).notNull(),
  seriesName: varchar("series_name", { length: 100 }).notNull(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const seriesWeeklyStatsTable = mysqlTable("series_weekly_stats", {
  id: varchar("id", { length: 21 })
    .primaryKey()
    .$default(() => nanoid()),

  sessionId: int("session_id").unique().notNull(),
  subSessionId: int("subsession_id").notNull(),
  seasonYear: int("season_year").notNull(),
  seasonQuarter: int("season_quarter").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  shortName: varchar("short_name", { length: 100 }).notNull(),
  trackName: varchar("track_name", { length: 100 }),
  raceWeek: int("race_week").notNull(),

  startTime: varchar("start_time", { length: 30 }).notNull(),
  strengthOfField: int("strength_of_field").notNull(), // ← Fixed this
  totalSplits: int("total_splits").notNull(),
  totalDrivers: int("total_drivers").notNull(),

  averageEntrants: decimal("average_entrants", {
    precision: 5,
    scale: 2,
  }).notNull(),
  averageSplits: decimal("average_splits", {
    precision: 5,
    scale: 2,
  }).notNull(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});
