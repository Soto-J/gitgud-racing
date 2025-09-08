import { inferRouterOutputs } from "@trpc/server";

import { AppRouter } from "@/trpc/routers/_app";

export type ProfilesData = inferRouterOutputs<AppRouter>["profile"]["getMany"];