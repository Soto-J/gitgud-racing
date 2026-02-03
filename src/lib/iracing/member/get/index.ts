import { fetchData, throwIracingError } from "@/lib/iracing/helpers/fetch-data";

import type { MemberGetResponse } from "./types";
import { MemberGetResponseSchema } from "./types/schema";

export async function fetchMemberGet(
  custId: string,
  accessToken: string,
): Promise<MemberGetResponse> {
  const response = await fetchData<MemberGetResponse>(
    `/data/member/get?cust_ids=${custId}&include_licenses=true`,
    accessToken,
  );

  if (!response.ok) {
    throwIracingError(response.error, response.message);
  }

  return MemberGetResponseSchema.parse(response.data);
}
