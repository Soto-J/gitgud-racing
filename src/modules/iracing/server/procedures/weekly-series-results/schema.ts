import { z } from "zod";

import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
} from "./params";

export const WeeklySeriesResultsInput = z.object({
  /** Page number for pagination (1-based) */
  page: z.number().default(DEFAULT_PAGE),
  /** Number of results per page */
  pageSize: z
    .number()
    .min(MIN_PAGE_SIZE)
    .max(MAX_PAGE_SIZE)
    .default(DEFAULT_PAGE_SIZE),
  /** Search term for filtering by series or track name */
  search: z.string().nullish(),

  /** Race week number to filter by */
  raceWeek: z.coerce.number().int().min(0).max(11).nullish(),
  /** Season year to filter by */
  year: z.coerce.number().int().positive().nullish(),
  /** Season quarter to filter by (1-4) */
  quarter: z.coerce.number().int().min(1).max(4).nullish(),
});

export type WeeklySeriesResultsInputType = z.infer<
  typeof WeeklySeriesResultsInput
>;

export type WeeklySeriesResults =
  inferRouterOutputs<AppRouter>["iracing"]["weeklySeriesResults"];
