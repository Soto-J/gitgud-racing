import { createTRPCRouter } from "@/trpc/init";

import { getProfileProcedure } from "./get-one";
import { getAllProfilesProcedure } from "./get-many";
import { createProfileProcedure } from "./create";
import { editProfileProcedure } from "./edit";

export const profileRouter = createTRPCRouter({
  // Profile query procedures
  getOne: getProfileProcedure,
  getMany: getAllProfilesProcedure,

  // Profile management procedures
  create: createProfileProcedure,
  edit: editProfileProcedure,
});
