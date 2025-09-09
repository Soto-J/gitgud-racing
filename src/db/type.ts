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
} from "./schema";

export type UserTable = InferSelectModel<typeof user>;
export type SessionTable = InferSelectModel<typeof session>;
export type AccountTable = InferSelectModel<typeof account>;
export type ProfileTable = InferSelectModel<typeof profileTable>;
export type iRacingAuthTable = InferSelectModel<typeof iracingAuthTable>;
export type LicenseTable = InferSelectModel<typeof iracingAuthTable>;
export type SeriessTable = InferSelectModel<typeof seriesTable>;
export type UserChartDataTable = InferSelectModel<typeof userChartDataTable>;
export type SeriesWeeklyStatsTable = InferSelectModel<
  typeof seriesWeeklyStatsTable
>;
