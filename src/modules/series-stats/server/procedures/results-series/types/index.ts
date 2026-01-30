import { z } from "zod";

import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

import { ResultsSeriesParamsSchema } from "./schemas";

export type ResultsSeriesParams = z.infer<typeof ResultsSeriesParamsSchema>;

export type SeriesResults =
  inferRouterOutputs<AppRouter>["seriesResults"]["resultsSearchSeries"];
