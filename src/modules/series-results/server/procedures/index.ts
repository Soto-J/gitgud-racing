import { createTRPCRouter } from "@/trpc/init";

import { weeklySeriesResultsProcedure } from "./weekly-series-results";
import { searchSeriesResultsProcedure } from "./search-series-results";

export const seriesResultsRouter = createTRPCRouter({
   weeklySeriesResults: weeklySeriesResultsProcedure,
  searchSeriesResults: searchSeriesResultsProcedure,
});
