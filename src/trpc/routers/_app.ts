import { createTRPCRouter } from "../init";

import { profileRouter } from "@/modules/profile/server/procedures";
import { membersRouter } from "@/modules/members/server/procedures";
import { iracingRouter } from "@/modules/iracing/server/procedures";
import { manageRouter } from "@/modules/manage/server/procedures";
import { seriesStatsRouter } from "@/modules/series-stats/server/procedures";
import { scheduleRouter } from "@/modules/schedule/server/procedures";

export const appRouter = createTRPCRouter({
  manage: manageRouter,
  members: membersRouter,
  profile: profileRouter,
  iracing: iracingRouter,
  seriesStats: seriesStatsRouter,
  schedule: scheduleRouter,
});

export type AppRouter = typeof appRouter;
