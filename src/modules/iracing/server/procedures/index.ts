import { createTRPCRouter } from "@/trpc/init";
import { getUserProcedure } from "./get-user";
import { getUserRecentRacesProcedure } from "./get-user-recent-races";
import { getUserSummaryProcedure } from "./get-user-summary";
import { userChartDataProcedure } from "./user-chart-data";
import {
  getAllSeriesProcedure,
  getTotalSeriesCountProcedure,
} from "./get-all-series";
import { weeklySeriesResultsProcedure } from "./weekly-series-results";
import { getDocumentationProcedure } from "./get-documentation";

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
