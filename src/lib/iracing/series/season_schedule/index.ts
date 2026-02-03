import { fetchData, throwIracingError } from "@/lib/iracing/helpers/fetch-data";
import { getAccessToken } from "@/lib/iracing/helpers/access-token";

export async function fetchSeriesSeasonSchedule(seasonId = 1) {
  const accessToken = await getAccessToken();

  const response = await fetchData(
    `/data/series/season_schedule?${seasonId}`,
    accessToken,
  );

  if (!response.ok) {
    throwIracingError(response.error, response.message);
  }

  console.log({ data: response.data });
}
