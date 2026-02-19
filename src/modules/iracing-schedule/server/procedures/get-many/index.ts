import { baseProcedure } from "@/trpc/init";

import { fetchSeriesSeasonList } from "@/lib/iracing/series/season_list";

export const getManyProcedure = baseProcedure.query(async () => {
  const response = await fetchSeriesSeasonList();
  return response.sort((a, b) => a.season_name.localeCompare(b.season_name, "en"));
});
