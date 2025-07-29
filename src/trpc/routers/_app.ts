import { createTRPCRouter } from "../init";

import { profileRouter } from "@/modules/profile/server/procedures";
import { membersRouter } from "@/modules/members/server/procedures";
import { iracingRouter } from "@/modules/iracing/server/procedures";

export const appRouter = createTRPCRouter({
  members: membersRouter,
  profile: profileRouter,
  iracing: iracingRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
