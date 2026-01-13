import { InferSelectModel } from "drizzle-orm";

import {
  session as SessionTable,
  account as AccountTable,
  user as UserTable,
  profileTable,
  seriesWeeklyStatsTable,
  userChartDataTable,
  licenseTable,
} from ".";

export type UserTable = InferSelectModel<typeof UserTable>;
export type SessionTable = InferSelectModel<typeof SessionTable>;
export type AccountTable = InferSelectModel<typeof AccountTable>;
export type ProfileTable = InferSelectModel<typeof profileTable>;
export type LicenseTable = InferSelectModel<typeof licenseTable>;
export type UserChartDataTable = InferSelectModel<typeof userChartDataTable>;
export type SeriesWeeklyStatsTable = InferSelectModel<
  typeof seriesWeeklyStatsTable
>;
