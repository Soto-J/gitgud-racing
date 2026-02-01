import { nanoid } from "nanoid";

import {
  mysqlTable,
  varchar,
  timestamp,
  int,
  unique,
  index,
  boolean,
} from "drizzle-orm/mysql-core";

export const seriesWeeklyStatsTable = mysqlTable(
  "series_weekly_stats",
  {
    id: varchar("id", { length: 21 })
      .primaryKey()
      .$default(() => nanoid()),
    seriesId: int("series_id").notNull(),
    seasonId: int("season_id").notNull(),

    name: varchar("name", { length: 100 }).notNull(),
    trackName: varchar("track_name", { length: 100 }).notNull(),

    seasonYear: int("season_year").notNull(),
    seasonQuarter: int("season_quarter").default(1).notNull(),
    raceWeek: int("race_week").default(0).notNull(),

    officialSession: boolean("official_session").notNull().default(true),
    totalRaceSessions: int("total_race_sessions").notNull(),
    totalSplits: int("total_splits").notNull(),
    totalDrivers: int("total_drivers").notNull(),
    averageStrengthOfField: int("average_strength_of_field").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    // One row per (series + season + race week)
    unique("weekly_series_unique").on(
      table.seriesId,
      table.seasonYear,
      table.seasonQuarter,
      table.raceWeek,
    ),

    index("season_lookup_idx").on(
      table.seasonYear,
      table.seasonQuarter,
      table.raceWeek,
    ),
  ],
);
