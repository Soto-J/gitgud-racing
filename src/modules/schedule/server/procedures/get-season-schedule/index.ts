import { iracingProcedure } from "@/trpc/init";

import { GetSeasonScheduleInputSchema } from "./schema";

export const seasonScheduleProcedure = iracingProcedure
  .input(GetSeasonScheduleInputSchema)
  .query(async () => {});