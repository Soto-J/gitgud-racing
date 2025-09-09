import z from "zod";
import { inferRouterOutputs } from "@trpc/server";

import { AppRouter } from "@/trpc/routers/_app";
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
} from "./params";

// =============================================================================
// INPUT SCHEMAS
// =============================================================================

export const WeeklySeriesResultsInput = z.object({
  page: z.number().default(DEFAULT_PAGE),
  pageSize: z
    .number()
    .min(MIN_PAGE_SIZE)
    .max(MAX_PAGE_SIZE)
    .default(DEFAULT_PAGE_SIZE),

  search: z.string().nullish(),
});

export type WeeklySeriesResultsInputType = z.infer<
  typeof WeeklySeriesResultsInput
>;

// =============================================================================
// API RESPONSE SCHEMAS
// =============================================================================

export const WeeklySeriesResultsItem = z.object({
  session_id: z.number(),
  subsession_id: z.number(),
  start_time: z.string(),
  end_time: z.string(),
  license_category_id: z.number(),
  license_category: z.string(),
  num_drivers: z.number(),
  num_cautions: z.number(),
  num_caution_laps: z.number(),
  num_lead_changes: z.number(),
  event_average_lap: z.number(),
  event_best_lap_time: z.number(),
  event_laps_complete: z.number(),
  driver_changes: z.boolean(),
  winner_group_id: z.number(),
  winner_name: z.string(),
  winner_ai: z.boolean(),
  track: z.object({
    config_name: z.string(),
    track_id: z.number(),
    track_name: z.string(),
  }),
  official_session: z.boolean(),
  season_id: z.number(),
  season_year: z.number(),
  season_quarter: z.number(),
  event_type: z.number(),
  event_type_name: z.string(),
  series_id: z.number(),
  series_name: z.string(),
  series_short_name: z.string(),
  race_week_num: z.number(),
  event_strength_of_field: z.number(),
});

export type WeeklySeriesResultsItemType = z.infer<
  typeof WeeklySeriesResultsItem
>;

export const WeeklySeriesResultsResponse = z.array(WeeklySeriesResultsItem);

export type WeeklySeriesResultsResponseType = z.infer<
  typeof WeeklySeriesResultsResponse
>;

export const WeeklySeriesResultsPromiseResponse = z.array(
  WeeklySeriesResultsResponse,
);

export type WeeklySeriesResultsPromiseResponseType = z.infer<
  typeof WeeklySeriesResultsPromiseResponse
>;

// =============================================================================
// ROUTER OUTPUT TYPES
// =============================================================================

export type WeeklySeriesResults =
  inferRouterOutputs<AppRouter>["iracing"]["weeklySeriesResults"];
