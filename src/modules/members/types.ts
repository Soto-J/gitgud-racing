import { inferRouterOutputs } from "@trpc/server";

import { AppRouter } from "@/trpc/routers/_app";

export type MemberGetOne = inferRouterOutputs<AppRouter>["members"]["getOne"];
