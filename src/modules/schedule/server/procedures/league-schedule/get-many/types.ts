import { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "@/trpc/routers/_app";

export type LeagueSchedules =
  inferRouterOutputs<AppRouter>["schedule"]["getLeagueSchedules"];
