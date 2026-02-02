import { z } from "zod";

import { ChartDataResponseSchema } from "./schemas";

export type ChartDataResponse = z.infer<typeof ChartDataResponseSchema>;
