import { iracingProcedure } from "@/trpc/init/iracing-procedure";
import { fetchIracingData } from "@/modules/iracing/server/api";

export const documentationProcedure = iracingProcedure.query(
  async ({ ctx }) => {
    return await fetchIracingData(`/data/doc`, ctx.iracingAccessToken);
  },
);
