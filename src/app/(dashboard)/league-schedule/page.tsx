import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { redirect } from "next/navigation";

import { trpc } from "@/trpc/server";

import { getCurrentSession } from "@/lib/auth/utils/get-current-session";

import LeagueScheduleView from "@/modules/league-schedule/ui/views/league-schedule-view";
import { HydrateClient, prefetch } from "@/components/hydration-client";
import UnderConstruction from "@/components/under-construction";

export default async function LeagueSchedulePage() {
  if (process.env.NODE_ENV !== "development") {
    <UnderConstruction
      title="Schedule view"
      message="Working on an amazing page for you!"
    />;
  }

  const session = await getCurrentSession();
  if (!session) redirect("/");

  const isAdmin =
    session.user.role === "admin" || session.user.role === "staff";
  // const seasonInfo = getCurrentSeasonInfo();

  // void queryClient.prefetchQuery(
  //   trpc.schedule.seasonSchedule.queryOptions({
  //     includeSeries: "true",
  //     seasonYear: seasonInfo.currentYear,
  //     seasonQuarter: seasonInfo.currentQuarter,
  //   }),
  // );

  prefetch(trpc.leagueSchedule.getLeagueSchedules.queryOptions());
  return (
    <HydrateClient>
      <Suspense fallback={<p>Loading..</p>}>
        <ErrorBoundary fallback={<p>Error..</p>}>
          <LeagueScheduleView />
        </ErrorBoundary>
      </Suspense>
    </HydrateClient>
  );
}
