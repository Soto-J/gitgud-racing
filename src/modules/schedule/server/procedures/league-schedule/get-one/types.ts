import { AppRouter } from "@/trpc/routers/_app";
import { inferRouterOutputs } from "@trpc/server";

export type SeasonSchedules =
  inferRouterOutputs<AppRouter>["schedule"]["getLeagueSchedule"];
