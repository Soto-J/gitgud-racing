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

export const safetyClassValues = ["A", "B", "C", "D", "R"] as const;
export const safetyClass = mysqlEnum("safety_class", safetyClassValues);

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

export const iracingAuth = mysqlTable("iracing_auth", {
  id: varchar("id", { length: 21 })
    .primaryKey()
    .$default(() => nanoid()),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),

  // Auth data
  authCookie: text("auth_cookie").notNull(),
  authCode: text("auth_code"),
  customerId: int("customer_id"),

  // SSO data (from your response)
  ssoCookieValue: text("sso_cookie_value"),

  // Timing
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  expiresAt: timestamp("expires_at"), // createdAt + 1 hour

  // Status
  isActive: boolean("is_active").default(true),
});

export const profile = mysqlTable("profile", {
  id: varchar("id", { length: 21 })
    .notNull()
    .primaryKey()
    .$default(() => nanoid()),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),

  iracingId: text("iracing_id"),
  isActive: boolean("is_active").notNull().default(false),

  discord: varchar("discord", { length: 37 }).default(""),
  team: varchar("team", { length: 20 }).default(""),
  bio: text("bio").default(""),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const license = mysqlTable("license", {
  id: varchar("id", { length: 21 })
    .notNull()
    .primaryKey()
    .$default(() => nanoid()),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),

  // Oval
  ovalIRating: int("oval_i_rating"),
  ovalSafetyRating: decimal("oval_safety_rating", { precision: 4, scale: 2 }),
  ovalLicenseClass: mysqlEnum("oval_license_class", safetyClassValues)
    .notNull()
    .default("R"),

  // Sports Car
  sportsCarIRating: int("sports_car_i_rating"),
  sportsCarSafetyRating: decimal("sports_car_safety_rating", {
    precision: 4,
    scale: 2,
  }),
  sportsCarLicenseClass: mysqlEnum("sports_license_class", safetyClassValues)
    .notNull()
    .default("R"),

  // Formula Car
  formulaCarIRating: int("formula_car_i_rating"),
  formulaCarSafetyRating: decimal("formula_car_safety_rating", {
    precision: 4,
    scale: 2,
  }),
  formulaCarLicenseClass: mysqlEnum("formula_license_class", safetyClassValues)
    .notNull()
    .default("R"),

  // Dirt oval road
  dirtOvalIRating: int("dirt_oval_i_rating"),
  dirtOvalSafetyRating: decimal("dirt_oval_safety_rating", {
    precision: 4,
    scale: 2,
  }),
  dirtOvalLicenseClass: mysqlEnum("dirt_oval_license_class", safetyClassValues)
    .notNull()
    .default("R"),

  // Dirt road
  dirtRoadIRating: int("dirt_road_i_rating"),
  dirtRoadSafetyRating: decimal("dirt_road_safety_rating", {
    precision: 4,
    scale: 2,
  }),
  dirtRoadLicenseClass: mysqlEnum("dirt_road_license_class", safetyClassValues)
    .notNull()
    .default("R"),

  // Meta fields
  lastIracingSync: timestamp("last_iracing_sync"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
