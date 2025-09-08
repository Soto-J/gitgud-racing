import { z } from "zod";
import { inferRouterOutputs } from "@trpc/server";

import { AppRouter } from "@/trpc/routers/_app";

export const GetSeasonScheduleInputSchema = z.object({ 
  seasonId: z.string() 
});

export type GetSeasonScheduleInput = z.infer<typeof GetSeasonScheduleInputSchema>;

export type SeasonSchedule = inferRouterOutputs<AppRouter>["schedule"]["getSeasonSchedule"];