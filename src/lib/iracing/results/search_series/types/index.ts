import { z } from "zod";
import {
  ChunkResponseSchema,
  SeriesResultsParamsSchema,
  SeriesResultsResponseSchema,
} from "./schema";

export type SeriesResultsParams = z.infer<typeof SeriesResultsParamsSchema>;
export type SeriesResultsResponse = z.infer<typeof SeriesResultsResponseSchema>;
export type ChunkResponse = z.infer<typeof ChunkResponseSchema>;
export type SeriesResult = ChunkResponse[number];