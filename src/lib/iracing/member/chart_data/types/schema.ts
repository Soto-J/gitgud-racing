import { z } from "zod";

export const ChartDataResponseSchema = z.array(
  z.object({
    blackout: z.boolean(),
    category_id: z.number(),
    chart_type: z.number(),
    cust_id: z.number(),
    data: z.array(
      z.object({
        when: z.coerce.date(),
        value: z.number(),
      }),
    ),
    success: z.boolean(),
  }),
);
