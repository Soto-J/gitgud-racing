import z from "zod";

import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
} from "./constants";

// =============================================================================
// USER DATA SCHEMAS
// =============================================================================

export const IRacingGetUserInputSchema = z.object({
  userId: z.string().min(1, { message: "Id is required" }),
});

export const IRacingUserChartDataInputSchema = IRacingGetUserInputSchema;

export const IRacingGetUserRecentRacesInputSchema = z.object({
  custId: z.string().min(1, { message: "Id is required" }),
});

export const IRacingGetUserSummaryInputSchema = IRacingGetUserRecentRacesInputSchema;

// =============================================================================
// SERIES DATA SCHEMAS
// =============================================================================

/**
 * Schema for fetching all series data with optional season filtering
 * Defaults to current year and quarter if not provided
 */
export const IRacingGetAllSeriesInputSchema = z.object({
  season_year: z
    .string()
    .regex(/^\d{4}$/, "Season year must be a 4-digit year")
    .optional()
    .transform((v) => v ?? new Date().getFullYear().toString()),
  season_quarter: z
    .string()
    .regex(/^[1-4]$/, "Season quarter must be 1, 2, 3, or 4")
    .optional()
    .transform(
      (v) => v ?? Math.ceil((new Date().getMonth() + 1) / 3).toString(),
    ),
  include_series: z.boolean().default(true),
});

export const IRacingWeeklySeriesResultsInputSchema = z.object({
  search: z.string().nullish(),
  pageSize: z
    .number()
    .min(MIN_PAGE_SIZE)
    .max(MAX_PAGE_SIZE)
    .default(DEFAULT_PAGE_SIZE),
  page: z.number().default(DEFAULT_PAGE),
});

// =============================================================================
// AUTHENTICATION SCHEMAS
// =============================================================================

export const IRacingLoginSchema = z.object({
  email: z.email(),
  password: z.string().min(1, { message: "Password required" }),
  userId: z.string().min(1, { message: "Id is required" }),
});