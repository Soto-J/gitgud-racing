import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { redirect } from "next/navigation";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient, trpc } from "@/trpc/server";

import { getSession } from "@/lib/get-session";
import { getCurrentSeasonInfo } from "@/app/api/cronjobs/utilities";

import SchedulePageView from "@/modules/schedule/ui/views/schedule-page-view";

export default async function SchedulePage() {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  const isAdmin =
    session.user.role === "admin" || session.user.role === "staff";

  const seasonInfo = getCurrentSeasonInfo();

  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(
    trpc.schedule.seasonSchedule.queryOptions({
      includeSeries: "true",
      seasonYear: seasonInfo.currentYear,
      seasonQuarter: seasonInfo.currentQuarter,
    }),
  );
  void queryClient.prefetchQuery(
    trpc.schedule.getLeagueSchedules.queryOptions(),
  );
  return (
    <>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<p>Loading..</p>}>
          <ErrorBoundary fallback={<p>Error..</p>}>
            <SchedulePageView seasonInfo={seasonInfo} isAdmin={isAdmin} />;
          </ErrorBoundary>
        </Suspense>
      </HydrationBoundary>
    </>
  );
}
