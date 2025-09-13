import { nanoid } from "nanoid";

import {
  mysqlTable,
  varchar,
  timestamp,
  int,
  decimal,
} from "drizzle-orm/mysql-core";

export const seriesWeeklyStatsTable = mysqlTable("series_weekly_stats", {
  id: varchar("id", { length: 21 })
    .primaryKey()
    .$default(() => nanoid()),
  seriesId: int("series_id").notNull(),
  seasonId: int("season_id").notNull(),
  sessionId: int("session_id").unique().notNull(),

  name: varchar("name", { length: 100 }).notNull(),
  seasonYear: int("season_year").notNull(),
  seasonQuarter: int("season_quarter").notNull(),
  raceWeek: int("race_week").notNull(),
  trackName: varchar("track_name", { length: 100 }).notNull(),
  startTime: varchar("start_time", { length: 30 }).notNull(),
  totalSplits: int("total_splits").notNull(),
  totalDrivers: int("total_drivers").notNull(),
  strengthOfField: int("strength_of_field").notNull(),

  averageEntrants: decimal("average_entrants", {
    precision: 5,
    scale: 2,
  }).notNull(),
  averageSplits: decimal("average_splits", {
    precision: 5,
    scale: 2,
  }).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
