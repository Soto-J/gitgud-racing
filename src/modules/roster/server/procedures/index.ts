import { createTRPCRouter } from "@/trpc/init";

import { getManyProcedure } from "./get-many";

export const rosterRouter = createTRPCRouter({
  getMany: getManyProcedure,
});
