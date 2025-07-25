import { createTRPCRouter } from "../init";
import { membersRouter } from "@/modules/members/server/procedures";

export const appRouter = createTRPCRouter({
  members: membersRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
