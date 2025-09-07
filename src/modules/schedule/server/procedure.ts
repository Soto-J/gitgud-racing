import { z } from "zod";

import { iracingProcedure } from "@/trpc/init";

export const seasonScheduleProcedure = iracingProcedure
  .input(z.object({ seasonId: z.string() }))
  .query(async () => {});
