import { z } from "zod";

export const DeleteLeagueScheduleInputSchema = z.object({
  scheduleId: z.string().min(1, "Schedule ID required."),
});
