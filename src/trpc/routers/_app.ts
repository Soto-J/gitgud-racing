import { createTRPCRouter } from "../init";

import { profileRouter } from "@/modules/profile/server/procedures";
import { membersRouter } from "@/modules/members/server/procedures";
import { iracingRouter } from "@/modules/iracing/server/procedures";
import { manageRouter } from "@/modules/manage/server/procedures";

export const appRouter = createTRPCRouter({
  manage: manageRouter,
  members: membersRouter,
  profile: profileRouter,
  iracing: iracingRouter,
});

export type AppRouter = typeof appRouter;
