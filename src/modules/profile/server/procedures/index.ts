import { createTRPCRouter } from "@/trpc/init";

import { getProfileProcedure } from "./get-one";
import { getProfileWithIracingProcedure } from "./get-one-with-iracing";
import { getAllProfilesProcedure } from "./get-many";
import { createProfileProcedure } from "./create";
import { editProfileProcedure } from "./edit";

export const profileRouter = createTRPCRouter({
  getOne: getProfileProcedure,
  getOneWithIracing: getProfileWithIracingProcedure,
  getMany: getAllProfilesProcedure,

  create: createProfileProcedure,
  edit: editProfileProcedure,
});
