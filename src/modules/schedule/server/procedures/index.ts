import { createTRPCRouter } from "@/trpc/init";

import { seasonScheduleProcedure } from "./season-schedule";
import { getLeagueScheduleProcedure } from "./league-schedule/get-one";
import { getLeagueSchedulesProcedure } from "./league-schedule/get-many";
import { editLeagueScheduleProcedure } from "./league-schedule/edit";
import { createLeagueScheduleProcedure } from "./league-schedule/create";
import { deleteLeagueScheduleProcedure } from "./league-schedule/delete";

export const scheduleRouter = createTRPCRouter({
  seasonSchedule: seasonScheduleProcedure,
  getLeagueSchedule: getLeagueScheduleProcedure,
  getLeagueSchedules: getLeagueSchedulesProcedure,
  editLeagueSchedule: editLeagueScheduleProcedure,
  createLeagueSchedule: createLeagueScheduleProcedure,
  deleteLeagueSchedule: deleteLeagueScheduleProcedure,
});
