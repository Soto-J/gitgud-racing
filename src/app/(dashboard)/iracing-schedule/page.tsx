import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import type { SearchParams } from "nuqs";

import { HydrateClient, prefetch } from "@/components/hydration-client";

import IracingScheduleView from "@/modules/iracing-schedule/ui/views/iracing-schedule-view";

interface IracingSchedulePageProps {
  searchParams: Promise<SearchParams>;
}

export default async function IracingSchedulePage({
  searchParams,
}: IracingSchedulePageProps) {
  return (
    <>
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
