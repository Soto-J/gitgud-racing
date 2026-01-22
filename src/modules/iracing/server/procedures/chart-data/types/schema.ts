import { z } from "zod";

export const UserChartDataInputSchema = z.object({
  userId: z.string().min(1, { message: "User ID required." }),
});

export const UserChartDataResponseSchema = z.array(
  z.object({
    /** Indicates if data is blacked out due to privacy settings */
    blackout: z.boolean(),
    category_id: z.number(),
    /** Chart type ID (Safety Rating, iRating, etc.) */
    chart_type: z.number(),
    cust_id: z.number(),
    /** Array of time-series data points */
    data: z.array(
      z.object({
        when: z.coerce.date(),
        value: z.number(),
      }),
    ),
    success: z.boolean(),
  }),
);
