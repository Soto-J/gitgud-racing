import { z } from "zod";

import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

import { WeeklySeriesResultsInputSchema } from "./schema";

export type WeeklySeriesResults =
  inferRouterOutputs<AppRouter>["seriesResults"]["weeklySeriesResults"];

export type WeeklySeriesResultsInputType = z.infer<
  typeof WeeklySeriesResultsInputSchema
>;
