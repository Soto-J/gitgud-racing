import { iracingProcedure } from "@/trpc/init/iracing-procedure";

import { fetchMemberSummary } from "@/lib/iracing/stats/member_summary";

export const userSummaryProcedure = iracingProcedure.query(async ({ ctx }) => {
  return await fetchMemberSummary(ctx.custId, ctx.iracingAccessToken);
});
