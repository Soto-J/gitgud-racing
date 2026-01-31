import { createTRPCRouter } from "@/trpc/init";

import { weeklySeriesResultsProcedure } from "./weekly-series-results";

export const seriesResultsRouter = createTRPCRouter({
  weeklySeriesResults: weeklySeriesResultsProcedure,
  // resultsSearchSeries: ResultsSearchSeriesProcedure,
});
