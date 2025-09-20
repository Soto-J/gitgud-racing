import { createTRPCRouter } from "@/trpc/init";

import { seasonScheduleProcedure } from "./season-schedule";
import { getLeagueScheduleProcedure } from "./league-schedule/get-one";
import { getLeagueSchedulesProcedure } from "./league-schedule/get-many";
import { editLeagueScheduleProcedure } from "./league-schedule/edit";

export const scheduleRouter = createTRPCRouter({
  seasonSchedule: seasonScheduleProcedure,
  getLeagueSchedule: getLeagueScheduleProcedure,
  getLeagueSchedules: getLeagueSchedulesProcedure,
  editLeagueSchedule: editLeagueScheduleProcedure,
});
