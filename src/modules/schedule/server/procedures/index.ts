import { createTRPCRouter } from "@/trpc/init";

import { seasonScheduleProcedure } from "./get-season-schedule";

export const scheduleRouter = createTRPCRouter({
  getSeasonSchedule: seasonScheduleProcedure,
});