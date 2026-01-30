import { createTRPCRouter } from "@/trpc/init";

import { ResultsSearchSeriesProcedure } from "./results-series";

export const seriesResultsRouter = createTRPCRouter({
  resultsSearchSeries: ResultsSearchSeriesProcedure,
});
