import { createTRPCRouter } from "@/trpc/init";
import { seasonScheduleProcedure } from "./season-schedule";

export const scheduleRouter = createTRPCRouter({
  seasonSchedule: seasonScheduleProcedure,
});
