import { fetchData, throwIracingError } from "@/lib/iracing/helpers/fetch-data";

import type { MemberRecentRacesResponse } from "./types";
import { MemberRecentRacesResponseSchema } from "./types/schemas";

export async function fetchMemberRecentRaces(
  custId: string,
  accessToken: string,
): Promise<MemberRecentRacesResponse> {
  const response = await fetchData<MemberRecentRacesResponse>(
    `/data/stats/member_recent_races?cust_id=${custId}`,
    accessToken,
  );

  if (!response.ok) {
    throwIracingError(response.error, response.message);
  }

  return MemberRecentRacesResponseSchema.parse(response.data);
}
