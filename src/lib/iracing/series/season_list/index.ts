import { fetchData, throwIracingError } from "@/lib/iracing/helpers/fetch-data";
import { getAccessToken } from "@/lib/iracing/helpers/access-token";
import { SeriesSeasonListSchema } from "./types/schema";

export async function fetchSeriesSeasonList(
  includeSeries = false,
  seasonYear = 2026,
  seasonQuarter = 1,
) {
  const accessToken = await getAccessToken();

  const response = await fetchData(
    `/data/series/season_list?include_series=${includeSeries}&season_year=${seasonYear}&season_quarter=${seasonQuarter}`,
    accessToken,
  );

  if (!response.ok) {
    throwIracingError(response.error, response.message);
  }

  const { data, error, success } = SeriesSeasonListSchema.safeParse(
    response.data,
  );

  if (!success) {
    console.error(error);
    return [];
  }

  return data.seasons;
}
