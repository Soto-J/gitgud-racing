import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";


export type LeagueScheduleGetMany =
  inferRouterOutputs<AppRouter>["leagueSchedule"]["getMany"];
