import { z } from "zod";

import { userChartDataTable } from "@/db/schema";

export type UserChartData = typeof userChartDataTable.$inferSelect;

export const IRacingUserChartDataInputSchema = z.object({
  userId: z.string().min(1, { message: "User ID required." }),
});

export const IRacingUserChartDataResponseSchema = z.array(
  z.object({
    blackout: z.boolean(),
    category_id: z.number(),
    chart_type: z.number(),
    data: z.array(
      z.object({
        when: z.date(),
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
