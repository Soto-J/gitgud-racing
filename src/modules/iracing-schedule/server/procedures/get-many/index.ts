import { baseProcedure } from "@/trpc/init";

import { fetchSeriesSeasonList } from "@/lib/iracing/series/season_list";

export const getManyProcedure = baseProcedure.query(async () => {
  const response = await fetchSeriesSeasonList();
  return response;
});
