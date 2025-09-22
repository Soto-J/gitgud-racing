import { z } from "zod";

export const CreateLeagueScheduleInputSchema = z.object({
  scheduleId: z.string().min(1, "Schedule ID required."),
  seasonNumber: z.int().min(1, "Season number required."),
  trackName: z.string().min(1, "Track name required."),
  temp: z.number().min(1, "Temperature required."),
  raceLength: z.number().min(1, "Race length required."),
  date: z.date().min(1, "Date Required."),
});
