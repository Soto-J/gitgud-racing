import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { redirect } from "next/navigation";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient, trpc } from "@/trpc/server";

import { getSession } from "@/lib/get-session";
import { getCurrentSeasonInfo } from "@/app/api/cronjobs/utilities";

import { SchedulePageView } from "@/modules/schedule/ui/views/schedule-page-view";

const SchedulePage = async () => {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  const seasonInfo = getCurrentSeasonInfo();

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.iracing.seasonSchedule.queryOptions({
      includeSeries: "true",
      seasonYear: seasonInfo.currentYear,
      seasonQuarter: seasonInfo.currentQuarter,
    }),
  );
  return (
    <>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<p>Loading..</p>}>
          <ErrorBoundary fallback={<p>Error..</p>}>
            <SchedulePageView seasonInfo={seasonInfo} />;
          </ErrorBoundary>
        </Suspense>
      </HydrationBoundary>
    </>
  );
};

export default SchedulePage;
