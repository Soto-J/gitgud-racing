import { z } from "zod";

import { ChartDataResponseSchema } from "./schema";

export type ChartDataResponse = z.infer<typeof ChartDataResponseSchema>;
