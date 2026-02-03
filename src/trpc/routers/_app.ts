import { createTRPCRouter } from "../init";

import { profileRouter } from "@/modules/profile/server/procedures";
import { rosterRouter } from "@/modules/roster/server/procedures";
import { iracingScheduleRouter } from "@/modules/iracing-schedule/server/procedures";
import { manageRouter } from "@/modules/manage/server/procedures";
import { seriesResultsRouter } from "@/modules/series-results/server/procedures";
import { leagueScheduleRouter } from "@/modules/league-schedule/server/procedures";

export const appRouter = createTRPCRouter({
  manage: manageRouter,
  roster: rosterRouter,
  profile: profileRouter,
  seriesResults: seriesResultsRouter,
  iracingSchedule: iracingScheduleRouter,
  leagueSchedule: leagueScheduleRouter,
});

export type AppRouter = typeof appRouter;
