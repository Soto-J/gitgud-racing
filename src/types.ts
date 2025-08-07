import { inferRouterOutputs } from "@trpc/server";

import { AppRouter } from "@/trpc/routers/_app";

export type LicenseGetUser =
  inferRouterOutputs<AppRouter>["iracing"]["getUser"];

