import { inferRouterOutputs } from "@trpc/server";

import { AppRouter } from "@/trpc/routers/_app";

export type ManageGetUser =
  inferRouterOutputs<AppRouter>["manage"]["getUser"];
export type ManageGetUsers =
  inferRouterOutputs<AppRouter>["manage"]["getUsers"];

// Legacy type aliases for compatibility
export type AdminGetUser = ManageGetUser;
export type AdminGetUsers = ManageGetUsers;
