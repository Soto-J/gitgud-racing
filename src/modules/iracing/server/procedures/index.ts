import { createTRPCRouter } from "@/trpc/init";

import { userLicensesProcedure } from "./user-licenses";
import { userRecentRacesProcedure } from "./user-recent-races";
import { userSummaryProcedure } from "./user-summary";
import { userChartDataProcedure } from "./user-chart-data";
import { weeklySeriesResultsProcedure } from "./weekly-series-results";
import { documentationProcedure } from "./documentation";

export const iracingRouter = createTRPCRouter({
  userLicenses: userLicensesProcedure,
  userRecentRaces: userRecentRacesProcedure,
  userSummary: userSummaryProcedure,

  userChartData: userChartDataProcedure,

  weeklySeriesResults: weeklySeriesResultsProcedure,

  getDocumentation: documentationProcedure,
});
