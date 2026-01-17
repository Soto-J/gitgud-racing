import { createTRPCRouter } from "@/trpc/init";

import { hasIracingConnectionProcedure } from "./has-iracing-connection";

export const authRouter = createTRPCRouter({
  hasIracingConnection: hasIracingConnectionProcedure,
});
