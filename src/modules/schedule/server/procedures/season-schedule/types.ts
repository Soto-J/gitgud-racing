import { z } from "zod";
import { SeasonScheduleResponse } from "./schema";
import { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "@/trpc/routers/_app";

export type SeasonScheduleResponseType = z.infer<typeof SeasonScheduleResponse>;
export type SeasonSchedule =
  inferRouterOutputs<AppRouter>["schedule"]["seasonSchedule"];
