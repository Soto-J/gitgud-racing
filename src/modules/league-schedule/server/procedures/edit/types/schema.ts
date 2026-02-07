import { z } from "zod";

import { SETUP_TYPE, START_TYPE } from "@/db/schemas";

export const LeagueScheduleSchema = z.object({
  seasonNumber: z.number().min(1, "Season number required."),
  date: z.string().min(1, "Date required."),

  car: z.string().min(1, "Car is required."),
  trackName: z.string().min(1, "Track name required."),
  setupType: z.enum(SETUP_TYPE),
  startType: z.enum(START_TYPE),

  raceLength: z.number().min(1, "Race length required."),

  temp: z.number().min(1, "Temperature required."),
  disqualification: z.number().min(0),
  carDamage: z.boolean(),
});

export const EditLeagueScheduleSchema = LeagueScheduleSchema.extend({
  scheduleId: z.string().min(1, "Schedule ID required."),
});
