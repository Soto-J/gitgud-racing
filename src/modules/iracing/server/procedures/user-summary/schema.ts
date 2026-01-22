/**
 * @fileoverview Schema definitions for user summary statistics procedures
 *
 * This module defines:
 * - Response schemas for iRacing member summary API validation
 * - Type definitions for user summary statistics
 * - Router output type inference
 */

import { z } from "zod";

import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

// =============================================================================
// API RESPONSE SCHEMAS
// =============================================================================

export const MemberSummary = z.object({
  /** Statistics for the current calendar year */
  this_year: z.object({
    num_official_sessions: z.number(),
    num_league_sessions: z.number(),
    num_official_wins: z.number(),
    num_league_wins: z.number(),
  }),
  cust_id: z.number(),
});

// =============================================================================
// ROUTER OUTPUT TYPES
// =============================================================================

export type UserSummary =
  inferRouterOutputs<AppRouter>["iracing"]["userSummary"];
