import { createTRPCRouter } from "@/trpc/init";

import { getUserProcedure } from "./get-user";
import { getUsersProcedure } from "./get-users";
import { updateUserProcedure } from "./edit-user";
import { deleteUserProcedure } from "./delete-user";

export const manageRouter = createTRPCRouter({
  // User query procedures
  getUser: getUserProcedure,
  getUsers: getUsersProcedure,

  // User management procedures
  editUser: updateUserProcedure,
  deleteUser: deleteUserProcedure,
});