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

export const GetUserChartDataInput = z.object({
  userId: z.string().min(1, { message: "User ID required." }),
});

// =============================================================================
// API RESPONSE SCHEMAS
// =============================================================================

export const GetUserChartDataResponse = z.array(
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

export type GetUserChartDataResponseType = z.infer<
  typeof GetUserChartDataResponse
>;

// =============================================================================
// INTERNAL TYPE DEFINITIONS
// =============================================================================

export type ChartData = typeof userChartDataTable.$inferSelect;

export type TransformLicensesInput = {
  user: InferSelectModel<typeof user>;
  profile: InferSelectModel<typeof profileTable> | null;
  licenses: InferSelectModel<typeof licenseTable> | null;
};

// =============================================================================
// ROUTER OUTPUT TYPES
// =============================================================================

export type UserChartData =
  inferRouterOutputs<AppRouter>["iracing"]["userChartData"];
