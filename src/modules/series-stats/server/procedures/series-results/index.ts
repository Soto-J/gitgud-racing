import { TRPCError } from "@trpc/server";
import { iracingProcedure } from "@/trpc/init/iracing-procedure";

export const weeklySeriesResultsProcedure = iracingProcedure.query(
  async ({ ctx, input }) => {
    // return {
    //   payload: payload.data,
    //   total: payload.data.length,
    // };

    return true;
  },
);
