import z from "zod";

export const IRacingUserSummaryResponseSchema = z.object({
  this_year: z.object({
    num_official_sessions: z.number(),
    num_league_sessions: z.number(),
    num_official_wins: z.number(),
    num_league_wins: z.number(),
  }),
  cust_id: z.number(),
});
