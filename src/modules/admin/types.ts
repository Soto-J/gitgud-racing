import { inferRouterOutputs } from "@trpc/server";

import { AppRouter } from "@/trpc/routers/_app";

export type AdminGetUser =
  inferRouterOutputs<AppRouter>["admin"]["getUser"];
export type AdminGetUsers =
  inferRouterOutputs<AppRouter>["admin"]["getUsers"];
