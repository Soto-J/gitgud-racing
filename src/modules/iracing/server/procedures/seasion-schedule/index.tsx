import { z } from "zod";

import { iracingProcedure } from "@/trpc/init";

export const seasonScheduleProcedure = iracingProcedure
  .input(
    z.object({
      seasonId: z.string().min(1, { message: "Season ID required." }),
    }),
  )
  .query(async ({ input }) => {});
