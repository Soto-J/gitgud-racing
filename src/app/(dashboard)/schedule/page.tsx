import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { redirect } from "next/navigation";

import { trpc } from "@/trpc/server";

import { getCurrentSession } from "@/lib/auth/utils/get-current-session";
// import { getCurrentSeasonInfo } from "@/app/api/cronjobs/utilities";

import SchedulePageView from "@/modules/schedule/ui/views/schedule-page-view";
import { HydrateClient, prefetch } from "@/components/hydration-client";

export default async function SchedulePage() {
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

  prefetch(trpc.schedule.getLeagueSchedules.queryOptions());
  return (
    <HydrateClient>
      <Suspense fallback={<p>Loading..</p>}>
        <ErrorBoundary fallback={<p>Error..</p>}>
          {/* <SchedulePageView seasonInfo={seasonInfo} isAdmin={isAdmin} />; */}
        </ErrorBoundary>
      </Suspense>
    </HydrateClient>
  );
}
