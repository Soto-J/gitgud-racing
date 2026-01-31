import { createTRPCRouter } from "@/trpc/init";

import { weeklySeriesResultsProcedure } from "./series-results";

export const seriesResultsRouter = createTRPCRouter({
  SeriesResults: weeklySeriesResultsProcedure,
  // resultsSearchSeries: ResultsSearchSeriesProcedure,
});
