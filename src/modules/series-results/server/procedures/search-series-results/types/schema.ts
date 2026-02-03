import { SeriesResultsParamsSchema } from "@/lib/iracing/results/search_series/types/schema";
import { z } from "zod";

/** Default page for pagination */
export const DEFAULT_PAGE = 1;
/** Default number of results per page */
export const DEFAULT_PAGE_SIZE = 5;
/** Minimum allowed page size */
export const MIN_PAGE_SIZE = 1;
/** Maximum allowed page size to prevent performance issues */
export const MAX_PAGE_SIZE = 100;

export const SeriesResultsInputSchema = z
  .object({
    page: z.number().default(DEFAULT_PAGE),
    pageSize: z
      .number()
      .min(MIN_PAGE_SIZE)
      .max(MAX_PAGE_SIZE)
      .default(DEFAULT_PAGE_SIZE),
    search: z.string().nullish(),
  })
  .extend(SeriesResultsParamsSchema.shape);
