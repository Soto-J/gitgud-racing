import { z } from "zod";
import { SeriesResultsParamsSchema } from "./schemas";

export type SeriesResultsParams = z.infer<typeof SeriesResultsParamsSchema>;
