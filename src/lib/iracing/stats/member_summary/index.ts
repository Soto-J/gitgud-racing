import { fetchData, throwIracingError } from "@/lib/iracing/helpers/fetch-data";

import type { MemberSummaryResponse } from "./types";
import { MemberSummaryResponseSchema } from "./types/schemas";

export async function fetchMemberSummary(
  custId: string,
  accessToken: string,
): Promise<MemberSummaryResponse> {
  const response = await fetchData<MemberSummaryResponse>(
    `/data/stats/member_summary?cust_id=${custId}`,
    accessToken,
  );

  if (!response.ok) {
    throwIracingError(response.error, response.message);
  }

  return MemberSummaryResponseSchema.parse(response.data);
}
