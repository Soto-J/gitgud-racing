import { AppRouter } from "@/trpc/routers/_app";
import { inferRouterOutputs } from "@trpc/server";

export type CreateLeagueSchedule =
  inferRouterOutputs<AppRouter>["schedule"]["createLeagueSchedule"];
