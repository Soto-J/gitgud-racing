import { iracingProcedure } from "@/trpc/init/iracing-procedure";

import {
  fetchIracingData,
  throwIracingError,
} from "@/modules/iracing/server/api";

import { MemberSummary } from "@/modules/iracing/server/procedures/get-user-summary/schema";

export const getUserSummaryProcedure = iracingProcedure.query(
  async ({ ctx }) => {
    if (!ctx.iracingAccessToken) {
      return null;
    }

    const res = await fetchIracingData(
      "/data/stats/member_summary",
      ctx.iracingAccessToken,
    );

    if (!res.ok) {
      throwIracingError(res.error, res.message);
    }

    return MemberSummary.parse(res.data);
  },
);
