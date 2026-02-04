import { AppRouter } from "@/trpc/routers/_app";
import { inferRouterOutputs } from "@trpc/server";

export type ProfileGetOneWithIracing =
  inferRouterOutputs<AppRouter>["profile"]["getOneWithIracing"];
