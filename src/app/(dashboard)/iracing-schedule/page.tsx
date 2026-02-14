import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import type { SearchParams } from "nuqs";

import { HydrateClient, prefetch } from "@/components/hydration-client";

import IracingScheduleView from "@/modules/iracing-schedule/ui/views/iracing-schedule-view";
import { fetchSeriesAssets } from "@/lib/iracing/series/assets";
import UnderConstruction from "@/components/under-construction";
import { fetchSeriesSeasonList } from "@/lib/iracing/series/season_list";
import { fetchSeasonList } from "@/lib/iracing/season/list";
import { fetchSeriesSeasonSchedule } from "@/lib/iracing/series/season_schedule";

interface IracingSchedulePageProps {
  searchParams: Promise<SearchParams>;
}

export default async function IracingSchedulePage({
  searchParams,
}: IracingSchedulePageProps) {
  if (process.env.NODE_ENV !== "development") {
    return <UnderConstruction title="iRacing Schedule" message="Stay tuned!" />;
  }
  await fetchSeriesSeasonSchedule();

  return (
    <>
      <HydrateClient>
        <Suspense fallback={<div>Loading..</div>}>
          <ErrorBoundary fallback={<div>Error</div>}>
            <UnderConstruction title="iRacing Schedule" message="Stay tuned!" />
            {/* <IracingScheduleView /> */}
          </ErrorBoundary>
        </Suspense>
      </HydrateClient>
    </>
  );
}
