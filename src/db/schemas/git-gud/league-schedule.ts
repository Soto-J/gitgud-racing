import { nanoid } from "nanoid";

import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

import { user as userTable } from "../auth";

export const leagueScheduleTable = mysqlTable("league_schedule", {
  id: varchar("id", { length: 21 })
    .primaryKey()
    .$default(() => nanoid()),

  seasonNumber: int("season_number").notNull(),
  date: timestamp("date").notNull(),

  car: varchar("car", { length: 127 }).notNull(),
  trackName: varchar("track_name", { length: 50 }).notNull(),
  setupType: mysqlEnum("setup_type", ["Open", "Fixed"])
    .default("Open")
    .notNull(),
  startType: mysqlEnum("start_type", ["Standing", "Rolling"])
    .default("Standing")
    .notNull(),

  raceLength: int("race_length").default(1).notNull(),

  temp: int("temp").notNull(),
  disqualification: int("disqualification").default(0).notNull(),
  carDamage: boolean("car_damage").default(true).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const leagueScheduleSignupTable = mysqlTable(
  "league_schedule_signup",
  {
    id: varchar("id", { length: 21 })
      .primaryKey()
      .$default(() => nanoid()),

    scheduleId: varchar("schedule_id", { length: 21 })
      .notNull()
      .references(() => leagueScheduleTable.id, { onDelete: "cascade" }),

    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),

    signedUpAt: timestamp("signed_up_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("schedule_user_idx").on(table.scheduleId, table.userId),
  ],
);
