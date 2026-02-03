import { z } from "zod";

import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

import { UserChartDataResponseSchema } from "./schema";

export type UserChartData =
  inferRouterOutputs<AppRouter>["profile"]["categoryChart"];

export type UserChartDataResponse = z.infer<typeof UserChartDataResponseSchema>;
