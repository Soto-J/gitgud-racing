import { AppRouter } from "@/trpc/routers/_app";
import { inferRouterOutputs } from "@trpc/server";

export type EditLeagueSchedule =
  inferRouterOutputs<AppRouter>["schedule"]["editLeagueSchedule"];
