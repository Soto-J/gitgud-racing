import { z } from "zod";

import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

import { SeriesResultsInputSchema } from "./schemas";

export type SearchSeriesResults =
  inferRouterOutputs<AppRouter>["seriesResults"]["searchSeriesResults"];

export type SearchSeriesResultsInputType = z.infer<
  typeof SeriesResultsInputSchema
>;
