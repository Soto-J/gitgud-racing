import { iracingProcedure } from "@/trpc/init";

import { fetchData } from "@/modules/iracing/server";

/**
 * Utility procedure for fetching iRacing API documentation
 */
export const getDocumentationProcedure = iracingProcedure.query(
  async ({ ctx }) => {
    return await fetchData({
      query: `/data/doc`,
      authCode: ctx.iracingAuthCode,
    });
  },
);
