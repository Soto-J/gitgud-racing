import z from "zod";
import { inferRouterOutputs } from "@trpc/server";

import { AppRouter } from "@/trpc/routers/_app";

// =============================================================================
// API RESPONSE SCHEMAS
// =============================================================================

export const IRacingUserSummaryResponseSchema = z.object({
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

export type IRacingUserSummary =
  inferRouterOutputs<AppRouter>["iracing"]["getUserSummary"];