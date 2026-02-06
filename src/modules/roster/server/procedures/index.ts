import { createTRPCRouter } from "@/trpc/init";

import { getManyProcedure } from "./get-many";
import { editUserProcedure } from "./edit-user";
import { deleteUserProcedure } from "./delete-user";
import { banUserProcedure } from "./ban-user";

export const rosterRouter = createTRPCRouter({
  getMany: getManyProcedure,
  editUser: editUserProcedure,
  deleteUser: deleteUserProcedure,
  banUser: banUserProcedure,
});
