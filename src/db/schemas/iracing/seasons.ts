import { nanoid } from "nanoid";

import {
  mysqlTable,
  varchar,
  timestamp,
  int,
  boolean,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

import { seriesTable } from "./series";

export const seasonTable = mysqlTable(
  "season",
  {
    id: int("season_id").primaryKey().notNull(),
    seriesId: int("series_id")
      .references(() => seriesTable.seriesId)
      .notNull(),

    // Basic identifiers
    seasonName: varchar("season_name", { length: 150 }).notNull(),
    seasonShortName: varchar("season_short_name", { length: 50 }),
    seasonYear: int("season_year").notNull(),
    seasonQuarter: int("season_quarter").notNull(),

    // Status flags
    active: boolean("active").default(false),
    complete: boolean("complete").default(false),
    official: boolean("official").default(true),

    // License & participation
    licenseGroup: int("license_group").notNull(),
    crossLicense: boolean("cross_license").default(false),

    // Season structure
    maxWeeks: int("max_weeks").notNull(),
    raceWeek: int("race_week").notNull(),
    drops: int("drops").notNull(),
    raceWeekToMakeDivisions: int("race_week_to_make_divisions").notNull(),

    // Car & setup rules
    fixedSetup: boolean("fixed_setup").default(false).notNull(),
    multiclass: boolean("multiclass").default(false).notNull(),

    // Racing rules
    incidentLimit: int("incident_limit").notNull(),
    incidentWarnMode: int("incident_warn_mode").notNull(),
    incidentWarnParam1: int("incident_warn_param1").notNull(),
    incidentWarnParam2: int("incident_warn_param2").notNull(),
    connectionBlackFlag: boolean("connection_black_flag").default(false),

    // Team rules
    maxTeamDrivers: int("max_team_drivers").notNull(),
    minTeamDrivers: int("min_team_drivers").notNull(),
    driverChanges: boolean("driver_changes").default(false),
    driverChangeRule: int("driver_change_rule").notNull(),
    qualifierMustStartRace: boolean("qualifier_must_start_race").default(false),

    // Session rules
    gridByClass: boolean("grid_by_class").default(false),

    // Timing & session
    opDuration: int("op_duration").notNull(),
    openPracticeSessionTypeId: int("open_practice_session_type_id").notNull(),
    numFastTows: int("num_fast_tows").notNull(),
    numOptLaps: int("num_opt_laps").notNull(),

    // Metadata
    scheduleDescription: varchar("schedule_description", { length: 200 }),
    startDate: varchar("start_date", { length: 30 }).notNull(),
    regUserCount: int("reg_user_count").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    // Prevent duplicate seasons for same series in same time period
    uniqueIndex("uniqueSeasonPeriod").on(
      table.seriesId,
      table.seasonYear,
      table.seasonQuarter,
    ),
  ],
);

export const raceScheduleTable = mysqlTable(
  "race_schedule",
  {
    id: varchar("id", { length: 21 })
      .primaryKey()
      .$default(() => nanoid()),
    seasonId: int("season_id")
      .references(() => seasonTable.id, { onDelete: "cascade" })
      .notNull(),

    // Week identification
    raceWeekNum: int("race_week_num").notNull(),
    scheduleName: varchar("schedule_name", { length: 150 }).notNull(),

    // Series info (for easier queries without joins)
    seriesId: int("series_id").notNull(),
    seriesName: varchar("series_name", { length: 100 }).notNull(),
    category: varchar("category", { length: 25 }).notNull(),
    categoryId: int("category_id").notNull(),
    trackId: int("track_id").notNull(),
    trackName: varchar("track_name", { length: 100 }).notNull(),

    // Week-specific overrides
    specialEventType: int("special_event_type").notNull(),
    sessionMinutes: int("session_minutes").notNull(),

    // Temps
    tempUnit: int("temp_unit").notNull(), // (0 = °F, 1 = °C)
    tempValue: int("temp_value").notNull(),
    skies: int("skies"),

    windUnits: int("wind_units").notNull(), // (0 = mph, 1 = kph, 2 = m/s)
    windValue: int("wind_value").notNull(), // (0 = North, 1 = North-East, 2 = East)
    timeofDay: int("time_of_day").notNull(),
    trackWater: int("track_water").notNull(),
    allow_fog: boolean("allow_fog").default(false),

    // Dates
    startDate: varchar("start_date", { length: 10 }).notNull(),
    firstSessionTime: varchar("first_sessoin_time", { length: 8 }).notNull(),
    repeatMinutes: int("repeat_minutes").notNull(),
    weekEndTime: varchar("week_end_time", { length: 30 }).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    // Prevent duplicate race weeks within same season
    uniqueIndex("uniqueSeasonWeek").on(table.seasonId, table.raceWeekNum),
  ],
);
