import { createTRPCRouter } from "@/trpc/init";
import { getUserProcedure } from "./get-user";
import { getUserRecentRacesProcedure } from "./get-user-recent-races";
import { getUserSummaryProcedure } from "./get-user-summary";
import { userChartDataProcedure } from "./user-chart-data";
import { getAllSeriesProcedure } from "./get-all-series";
import { weeklySeriesResultsProcedure } from "./weekly-series-results";
import { getTotalSeriesCountProcedure } from "./get-total-series-count";
import { getDocumentationProcedure } from "./get-documentation";


// =============================================================================
// ROUTER EXPORT
// =============================================================================

export const iracingRouter = createTRPCRouter({
  // User procedures
  getUser: getUserProcedure,
  getUserRecentRaces: getUserRecentRacesProcedure,
  getUserSummary: getUserSummaryProcedure,

  // Chart data procedures
  userChartData: userChartDataProcedure,

  // Series procedures
  getAllSeries: getAllSeriesProcedure,
  weeklySeriesResults: weeklySeriesResultsProcedure,
  getTotalSeriesCount: getTotalSeriesCountProcedure,

  // Utility procedures
  getDocumentation: getDocumentationProcedure,
});
