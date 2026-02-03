import { createTRPCRouter } from "@/trpc/init";

import { getProfileProcedure } from "./get-one";
import { getProfileWithIracingProcedure } from "./get-one-with-iracing";
import { getAllProfilesProcedure } from "./get-many";
import { createProfileProcedure } from "./create";
import { editProfileProcedure } from "./edit";
import { userSummaryProcedure } from "./user-summary";
import { categoryChartProcedure } from "./category-chart";

export const profileRouter = createTRPCRouter({
  getOne: getProfileProcedure,
  getOneWithIracing: getProfileWithIracingProcedure,
  getMany: getAllProfilesProcedure,

  categoryChart: categoryChartProcedure,
  userSummary: userSummaryProcedure,
  create: createProfileProcedure,
  edit: editProfileProcedure,
});
