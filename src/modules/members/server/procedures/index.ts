import { createTRPCRouter } from "@/trpc/init";

import { getOneProcedure } from "./get-one";
import { getManyProcedure } from "./get-many";

export const membersRouter = createTRPCRouter({
  getOne: getOneProcedure,
  getMany: getManyProcedure,
});
