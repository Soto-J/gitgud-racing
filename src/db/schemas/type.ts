import { InferSelectModel } from "drizzle-orm";

import {
  session as sessionTable,
  account as accountTable,
  user as userTable,
  profileTable,
  seriesWeeklyStatsTable,
  USER_ROLES,
  leagueScheduleTable,
} from ".";

export type UserTable = InferSelectModel<typeof userTable>;
export type SessionTable = InferSelectModel<typeof sessionTable>;
export type AccountTable = InferSelectModel<typeof accountTable>;
export type ProfileTable = InferSelectModel<typeof profileTable>;
export type SeriesWeeklyStatsTable = InferSelectModel<
  typeof seriesWeeklyStatsTable
>;
export type LeagueScheduleTable = InferSelectModel<typeof leagueScheduleTable>;

export type UserRole = (typeof USER_ROLES)[number];
