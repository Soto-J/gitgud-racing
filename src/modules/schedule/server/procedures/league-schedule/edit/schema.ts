import { z } from "zod";

export const LeagueScheduleSchema = z.object({
  seasonNumber: z.int(),
  trackName: z.string(),
  temp: z.number(),
  raceLength: z.number(),
  date: z.string(),
});

export const EditLeagueScheduleSchema = LeagueScheduleSchema.extend({
  scheduleId: z.string().min(1, "Schedule ID required."),
});
