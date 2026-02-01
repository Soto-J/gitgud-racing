import { nanoid } from "nanoid";

import {
  mysqlTable,
  varchar,
  timestamp,
  mysqlEnum,
  int,
  decimal,
} from "drizzle-orm/mysql-core";

import { user as userTable } from "@/db/schemas/auth";

export const safetyClassValues = ["A", "B", "C", "D", "R"] as const;

export const licenseTable = mysqlTable("license", {
  id: varchar("id", { length: 21 })
    .primaryKey()
    .$default(() => nanoid())
    .notNull(),
  userId: varchar("user_id", { length: 36 })
    .references(() => userTable.id, { onDelete: "cascade" })
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
