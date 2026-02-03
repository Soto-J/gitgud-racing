import { z } from "zod";

export const GetLeagueScheduleSchema = z.object({
  scheduleId: z.string().min(1, "Schedule ID required."),
});
