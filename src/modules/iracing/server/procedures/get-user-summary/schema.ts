/**
 * @fileoverview Schema definitions for user summary statistics procedures
 *
 * This module defines:
 * - Response schemas for iRacing member summary API validation
 * - Type definitions for user summary statistics
 * - Router output type inference
 */

import z from "zod";

import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

// =============================================================================
// API RESPONSE SCHEMAS
// =============================================================================

/**
 * Schema for validating iRacing member summary API responses
 *
 * Validates user statistics for the current year, including session
 * participation counts and win tallies for both official races and
 * league events.
 *
 * @example
 * ```typescript
 * const apiData = await fetchMemberSummary(custId);
 * const summary = GetUserSummaryResponse.parse(apiData);
 * console.log(`User has ${summary.this_year.num_official_wins} wins this year`);
 * ```
 */
export const GetUserSummaryResponse = z.object({
  /** Statistics for the current calendar year */
  this_year: z.object({
    /** Number of official iRacing sessions participated in */
    num_official_sessions: z.number(),
    /** Number of league sessions participated in */
    num_league_sessions: z.number(),
    /** Number of wins in official iRacing sessions */
    num_official_wins: z.number(),
    /** Number of wins in league sessions */
    num_league_wins: z.number(),
  }),
  /** iRacing customer ID */
  cust_id: z.number(),
});

// =============================================================================
// ROUTER OUTPUT TYPES
// =============================================================================

/**
 * Type-safe output type for the getUserSummary tRPC procedure
 *
 * Automatically inferred from the router definition to ensure
 * type safety between server and client code.
 *
 * @example
 * ```typescript
 * // Frontend usage with type safety
 * const { data: summary } = trpc.iracing.getUserSummary.useQuery();
 * if (summary) {
 *   console.log(`Official wins: ${summary.this_year.num_official_wins}`);
 * }
 * ```
 */
export type UserSummary =
  inferRouterOutputs<AppRouter>["iracing"]["getUserSummary"];
