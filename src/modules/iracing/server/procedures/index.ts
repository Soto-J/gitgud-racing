import { createTRPCRouter } from "@/trpc/init";

import { userLicensesProcedure } from "./user-licenses";
import { userRecentRacesProcedure } from "./user-recent-races";
import { userSummaryProcedure } from "./user-summary";
import { chartDataProcedure } from "./chart-data";
import { weeklySeriesResultsProcedure } from "./weekly-series-results";
import { documentationProcedure } from "./documentation";

export const iracingRouter = createTRPCRouter({
  userLicenses: userLicensesProcedure,
  userRecentRaces: userRecentRacesProcedure,
  userSummary: userSummaryProcedure,
  userChartData: chartDataProcedure,

  weeklySeriesResults: weeklySeriesResultsProcedure,

  getDocumentation: documentationProcedure,
});
