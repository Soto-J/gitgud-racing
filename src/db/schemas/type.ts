import { InferSelectModel } from "drizzle-orm";

import {
  session as sessionTable,
  account as accountTable,
  user as userTable,
  profileTable,
  seriesWeeklyStatsTable,
  userChartDataTable,
  licenseTable,
  USER_ROLES,
} from ".";

export type UserTable = InferSelectModel<typeof userTable>;
export type SessionTable = InferSelectModel<typeof sessionTable>;
export type AccountTable = InferSelectModel<typeof accountTable>;
export type ProfileTable = InferSelectModel<typeof profileTable>;
export type LicenseTable = InferSelectModel<typeof licenseTable>;
export type UserChartDataTable = InferSelectModel<typeof userChartDataTable>;
export type SeriesWeeklyStatsTable = InferSelectModel<
  typeof seriesWeeklyStatsTable
>;

export type UserRole = (typeof USER_ROLES)[number];
