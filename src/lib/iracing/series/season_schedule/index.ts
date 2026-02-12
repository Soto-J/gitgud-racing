import { fetchData, throwIracingError } from "@/lib/iracing/helpers/fetch-data";
import { getAccessToken } from "@/lib/iracing/helpers/access-token";
import { SeriesSeasonScheduleSchema } from "./types/schema";

export async function fetchSeriesSeasonSchedule(seasonId = 6013) {
  const accessToken = await getAccessToken();

  const response = await fetchData(
    `/data/series/season_schedule?season_id=${seasonId}`,
    accessToken,
  );

  if (!response.ok) {
    throwIracingError(response.error, response.message);
  }

  // console.log({ data: response.data.schedules[0].weather });

  return SeriesSeasonScheduleSchema.parse(response.data);
}
