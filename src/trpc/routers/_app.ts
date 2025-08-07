import { createTRPCRouter } from "../init";

import { profileRouter } from "@/modules/profile/server/procedures";
import { membersRouter } from "@/modules/members/server/procedures";
import { iracingRouter } from "@/modules/iracing/server/procedures";
import { adminRouter } from "@/modules/admin/server/procedure";

export const appRouter = createTRPCRouter({
  admin: adminRouter,
  members: membersRouter,
  profile: profileRouter,
  iracing: iracingRouter,
  
});

// export type definition of API
export type AppRouter = typeof appRouter;
