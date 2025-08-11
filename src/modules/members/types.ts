import { inferRouterOutputs } from "@trpc/server";

import { AppRouter } from "@/trpc/routers/_app";

export type MembersGetOne = inferRouterOutputs<AppRouter>["members"]["getOne"];
export type MembersGetMany =
  inferRouterOutputs<AppRouter>["members"]["getMany"];
