import { z } from "zod";

import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

import { SeasonScheduleResponse } from "./schema";

export type SeasonScheduleResponseType = z.infer<typeof SeasonScheduleResponse>;
export type SeasonSchedule =
  inferRouterOutputs<AppRouter>["schedule"]["seasonSchedule"];
