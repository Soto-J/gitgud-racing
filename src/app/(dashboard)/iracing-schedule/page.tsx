import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { SearchParams } from "nuqs";

import { HydrateClient, prefetch } from "@/components/hydration-client";

import ManageListHeader from "@/modules/manage/ui/components/manage-list-header";

import IracingScheduleView from "@/modules/iracing-schedule/ui/views/iracing-schedule-view";

interface IracingScheduleProps {
  searchParams: Promise<SearchParams>;
}

export default async function IracingSchedule({
  searchParams,
}: IracingScheduleProps) {
  
  return (
    <>
      <ManageListHeader />

      <HydrateClient>
        <Suspense fallback={<div>Loading..</div>}>
          <ErrorBoundary fallback={<div>Error</div>}>
            <IracingScheduleView />
          </ErrorBoundary>
        </Suspense>
      </HydrateClient>
    </>
  );
}
