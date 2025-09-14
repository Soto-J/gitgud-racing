import { createTRPCRouter } from "@/trpc/init";
import { totalSeriesCountProcedure } from "./total-series-count";

export const seriesStatsRouter = createTRPCRouter({
  totalSeriesCount: totalSeriesCountProcedure,
});
