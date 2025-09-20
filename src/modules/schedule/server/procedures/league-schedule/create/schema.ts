import { z } from "zod";

export const CreateLeagueScheduleInputSchema = z.object({
  scheduleId: z.string().min(1, "Schedule ID required."),
  track: z.string(),
  temp: z.number(),
  raceLength: z.number(),
  date: z.date(),
});
