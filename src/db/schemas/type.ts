import { InferSelectModel } from "drizzle-orm";

import {
  account,
  iracingAuthTable,
  profileTable,
  seriesTable,
  seriesWeeklyStatsTable,
  session,
  user,
  userChartDataTable,
  licenseTable,
  seasonTable,
  raceScheduleTable,
} from ".";

export type UserTable = InferSelectModel<typeof user>;
export type SessionTable = InferSelectModel<typeof session>;
export type AccountTable = InferSelectModel<typeof account>;
export type ProfileTable = InferSelectModel<typeof profileTable>;
export type IRacingAuthTable = InferSelectModel<typeof iracingAuthTable>;
export type LicenseTable = InferSelectModel<typeof licenseTable>;
export type SeriesTable = InferSelectModel<typeof seriesTable>;
export type UserChartDataTable = InferSelectModel<typeof userChartDataTable>;
export type SeriesWeeklyStatsTable = InferSelectModel<
  typeof seriesWeeklyStatsTable
>;
export type SeasonTable = InferSelectModel<typeof seasonTable>;
export type RaceScheduleTable = InferSelectModel<typeof raceScheduleTable>;
