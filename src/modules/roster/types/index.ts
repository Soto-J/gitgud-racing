import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

export type MembersGetOne = inferRouterOutputs<AppRouter>["roster"]["getOne"];
export type MembersGetMany = inferRouterOutputs<AppRouter>["roster"]["getMany"];
