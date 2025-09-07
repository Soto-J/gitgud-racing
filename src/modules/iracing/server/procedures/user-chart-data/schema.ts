import z from "zod";
import { InferSelectModel } from "drizzle-orm";
import { inferRouterOutputs } from "@trpc/server";

import { AppRouter } from "@/trpc/routers/_app";
import {
  licenseTable,
  profileTable,
  user,
  userChartDataTable,
} from "@/db/schema";

// =============================================================================
// INPUT SCHEMAS
// =============================================================================

export const IRacingUserChartDataInputSchema = z.object({
  userId: z.string().min(1, { message: "User ID required." }),
});

// =============================================================================
// API RESPONSE SCHEMAS
// =============================================================================

export const IRacingUserChartDataResponseSchema = z.array(
  z.object({
    blackout: z.boolean(),
    category_id: z.number(),
    chart_type: z.number(),
    data: z.array(
      z.object({
        when: z.coerce.date(),
        value: z.number(),
      }),
    ),
    success: z.boolean(),
    cust_id: z.number(),
  }),
);

export type IRacingUserChartDataResponse = z.infer<
  typeof IRacingUserChartDataResponseSchema
>;

// =============================================================================
// INTERNAL TYPE DEFINITIONS
// =============================================================================

export type IRacingChartData = typeof userChartDataTable.$inferSelect;

export type IRacingTransformLicensesInput = {
  user: InferSelectModel<typeof user>;
  profile: InferSelectModel<typeof profileTable> | null;
  licenses: InferSelectModel<typeof licenseTable> | null;
};

// =============================================================================
// ROUTER OUTPUT TYPES
// =============================================================================

export type GetChartData =
  inferRouterOutputs<AppRouter>["iracing"]["userChartData"];
