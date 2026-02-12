import { fetchData, throwIracingError } from "@/lib/iracing/helpers/fetch-data";
import { getAccessToken } from "@/lib/iracing/helpers/access-token";
import { SeasonListSchema } from "./types/schema";

export async function fetchSeasonList(seasonYear = 2026, seasonQuarter = 1) {
  const accessToken = await getAccessToken();

  const response = await fetchData(
    `/data/season/list?season_year=${seasonYear}&season_quarter=${seasonQuarter}`,
    accessToken,
  );

  console.log({ response });

  if (!response.ok) {
    throwIracingError(response.error, response.message);
  }

//   console.log({ data: response.data.seasons[10] });

  return SeasonListSchema.parse(response.data);
}
