/**
 * @fileoverview Schema definitions for weekly series results procedures
 *
 * This module defines:
 * - Input validation schemas for weekly series results requests
 * - Response schemas for iRacing series results API validation
 * - Type definitions for series result data structures
 * - Router output type inference
 */

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

/**
 * Schema for validating weekly series results requests
 *
 * Supports pagination, search filtering, and season-specific filtering
 * by race week, year, and quarter.
 *
 * @example
 * ```typescript
 * const input = WeeklySeriesResultsInput.parse({
 *   page: 1,
 *   pageSize: 20,
 *   search: "Formula",
 *   raceWeek: "12",
 *   year: "2024",
 *   quarter: "1"
 * });
 * ```
 */
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

// =============================================================================
// API RESPONSE SCHEMAS
// =============================================================================

/**
 * Schema for validating individual series result data from iRacing API
 *
 * Represents a single race session result with comprehensive metadata
 * including session details, race statistics, winner information, and
 * track/series data.
 *
 * @example
 * ```typescript
 * const result = SeriesResultSchema.parse(apiResponse);
 * console.log(`Winner: ${result.winner_name} at ${result.track.track_name}`);
 * ```
 */
export const SeriesResultSchema = z.object({
  /** Unique session identifier */
  session_id: z.number(),
  /** Unique subsession identifier */
  subsession_id: z.number(),
  /** Session start time (ISO string) */
  start_time: z.string(),
  /** Session end time (ISO string) */
  end_time: z.string(),
  /** License category ID (A, B, C, D, R) */
  license_category_id: z.number(),
  /** License category name */
  license_category: z.string(),
  /** Total number of drivers in the session */
  num_drivers: z.number(),
  /** Number of caution periods */
  num_cautions: z.number(),
  /** Total laps under caution */
  num_caution_laps: z.number(),
  /** Number of lead changes during the race */
  num_lead_changes: z.number(),
  /** Average lap time across all drivers (seconds) */
  event_average_lap: z.number(),
  /** Fastest lap time of the session (seconds) */
  event_best_lap_time: z.number(),
  /** Total laps completed in the session */
  event_laps_complete: z.number(),
  /** Whether driver changes were allowed */
  driver_changes: z.boolean(),
  /** Winner's group/team ID */
  winner_group_id: z.number(),
  /** Winner's display name */
  winner_name: z.string(),
  /** Whether the winner was an AI driver */
  winner_ai: z.boolean(),
  /** Track information */
  track: z.object({
    /** Track configuration name */
    config_name: z.string(),
    /** Unique track identifier */
    track_id: z.number(),
    /** Track display name */
    track_name: z.string(),
  }),
  /** Whether this was an official session */
  official_session: z.boolean(),
  /** Season identifier */
  season_id: z.number(),
  /** Season year */
  season_year: z.number(),
  /** Season quarter (1-4) */
  season_quarter: z.number(),
  /** Event type identifier */
  event_type: z.number(),
  /** Event type display name */
  event_type_name: z.string(),
  /** Series identifier */
  series_id: z.number(),
  /** Series full name */
  series_name: z.string(),
  /** Series abbreviated name */
  series_short_name: z.string(),
  /** Race week number within the season */
  race_week_num: z.number(),
  /** Average iRating of all participants */
  event_strength_of_field: z.number(),
});

export type SeriesResults = z.infer<typeof SeriesResultSchema>;

/**
 * Schema for validating arrays of series results from iRacing API
 *
 * @example
 * ```typescript
 * const results = SeriesResultsResponseSchema.parse(apiResponse);
 * console.log(`Found ${results.length} race sessions`);
 * ```
 */
export const SeriesResultsResponseSchema = z.array(SeriesResultSchema);

export type SeriesResultsResponse = z.infer<typeof SeriesResultsResponseSchema>;

// =============================================================================
// ROUTER OUTPUT TYPES
// =============================================================================

/**
 * Type-safe output type for the weeklySeriesResults tRPC procedure
 *
 * Automatically inferred from the router definition to ensure
 * type safety between server and client code.
 *
 * @example
 * ```typescript
 * // Frontend usage with type safety
 * const { data } = trpc.iracing.weeklySeriesResults.useQuery({
 *   page: 1,
 *   pageSize: 20,
 *   search: "Formula"
 * });
 * // data is fully typed as WeeklySeriesResults
 * ```
 */
export type WeeklySeriesResults =
  inferRouterOutputs<AppRouter>["iracing"]["weeklySeriesResults"];
