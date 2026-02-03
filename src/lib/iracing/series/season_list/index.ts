import { fetchData, throwIracingError } from "@/lib/iracing/helpers/fetch-data";
import { getAccessToken } from "@/lib/iracing/helpers/access-token";

export async function fetchSeriesSeasonList(
  includeSeries = true,
  seasonYear = 2026,
  seasonQuarter = 1,
) {
  const accessToken = await getAccessToken();

  const response = await fetchData(
    `/data/series/season_list=${includeSeries}&season_year=${seasonYear}&season_quarter=${seasonQuarter}`,
    accessToken,
  );

  if (!response.ok) {
    throwIracingError(response.error, response.message);
  }

  console.log({ data: response.data });
}
