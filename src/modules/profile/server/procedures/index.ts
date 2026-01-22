import { createTRPCRouter } from "@/trpc/init";

import { getProfileProcedure } from "./get-one";
import { getAllProfilesProcedure } from "./get-many";
import { createProfileProcedure } from "./create";
import { editProfileProcedure } from "./edit";

export const profileRouter = createTRPCRouter({
  getOne: getProfileProcedure,
  getMany: getAllProfilesProcedure,

  create: createProfileProcedure,
  edit: editProfileProcedure,
});
