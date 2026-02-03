import { z } from "zod";

import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

import { UserChartDataResponseSchema } from "./schemas";
import { userChartDataTable } from "@/db/schemas";

export type UserChartData =
  inferRouterOutputs<AppRouter>["profile"]["categoryChart"];

export type UserChartDataResponse = z.infer<typeof UserChartDataResponseSchema>;

export type ChartData = typeof userChartDataTable.$inferSelect;
