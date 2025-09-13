import { InferSelectModel } from "drizzle-orm";

import {
  account,
  iracingAuthTable,
  profileTable,
  seriesWeeklyStatsTable,
  session,
  user,
  userChartDataTable,
  licenseTable,
} from ".";

export type UserTable = InferSelectModel<typeof user>;
export type SessionTable = InferSelectModel<typeof session>;
export type AccountTable = InferSelectModel<typeof account>;
export type ProfileTable = InferSelectModel<typeof profileTable>;
export type IRacingAuthTable = InferSelectModel<typeof iracingAuthTable>;
export type LicenseTable = InferSelectModel<typeof licenseTable>;
export type UserChartDataTable = InferSelectModel<typeof userChartDataTable>;
export type SeriesWeeklyStatsTable = InferSelectModel<
  typeof seriesWeeklyStatsTable
>;