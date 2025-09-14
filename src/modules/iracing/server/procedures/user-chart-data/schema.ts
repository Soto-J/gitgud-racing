/**
 * @fileoverview Schema definitions for iRacing user chart data procedures
 *
 * This module defines:
 * - Input validation schemas for chart data requests
 * - Response schemas for iRacing API data validation
 * - Type definitions for internal data transformations
 * - Router output type inference
 */

import z from "zod";

import { InferSelectModel } from "drizzle-orm";
import { inferRouterOutputs } from "@trpc/server";

import { AppRouter } from "@/trpc/routers/_app";
import {
  licenseTable,
  profileTable,
  user,
  userChartDataTable,
} from "@/db/schemas";

// =============================================================================
// INPUT SCHEMAS
// =============================================================================

/**
 * Schema for validating user chart data requests
 *
 * @example
 * ```typescript
 * const input = UserChartDataInputSchema.parse({ userId: "123" });
 * ```
 */
export const UserChartDataInputSchema = z.object({
  /** User ID for which to fetch chart data */
  userId: z.string().min(1, { message: "User ID required." }),
});

// =============================================================================
// API RESPONSE SCHEMAS
// =============================================================================

/**
 * Schema for validating iRacing chart data API responses
 *
 * Validates the structure of chart data returned from iRacing's API,
 * ensuring data integrity before processing and database insertion.
 *
 * @example
 * ```typescript
 * const apiData = await fetchFromIRacingAPI(custId);
 * const validatedData = UserChartDataResponseSchema.parse(apiData);
 * ```
 */
export const UserChartDataResponseSchema = z.array(
  z.object({
    /** Indicates if data is blacked out due to privacy settings */
    blackout: z.boolean(),
    /** Category ID representing racing discipline (Oval, Road, etc.) */
    category_id: z.number(),
    /** Chart type ID (Safety Rating, iRating, etc.) */
    chart_type: z.number(),
    /** Array of time-series data points */
    data: z.array(
      z.object({
        /** Timestamp when the data point was recorded */
        when: z.coerce.date(),
        /** Numeric value for the data point */
        value: z.number(),
      }),
    ),
    /** Indicates if the API request was successful */
    success: z.boolean(),
    /** Customer ID from iRacing */
    cust_id: z.number(),
  }),
);

export type UserChartDataResponse = z.infer<typeof UserChartDataResponseSchema>;

// =============================================================================
// INTERNAL TYPE DEFINITIONS
// =============================================================================

/**
 * Type representing a chart data record from the database
 *
 * Inferred from the userChartDataTable schema, includes all fields
 * necessary for chart rendering and data manipulation.
 */
export type ChartData = typeof userChartDataTable.$inferSelect;


// =============================================================================
// ROUTER OUTPUT TYPES
// =============================================================================

/**
 * Type-safe output type for the userChartData tRPC procedure
 *
 * Automatically inferred from the router definition to ensure
 * type safety between server and client code.
 */
export type UserChartData =
  inferRouterOutputs<AppRouter>["iracing"]["userChartData"];
