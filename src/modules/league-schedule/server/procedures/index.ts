import { createTRPCRouter } from "@/trpc/init";

import { getOneProcedure } from "./get-one";
import { getManyProcedure } from "./get-many";
import { editProcedure } from "./edit";
import { createProcedure } from "./create";
import { deleteProcedure } from "./delete";

export const leagueScheduleRouter = createTRPCRouter({
  getOne: getOneProcedure,
  getMany: getManyProcedure,
  edit: editProcedure,
  create: createProcedure,
  delete: deleteProcedure,
});
