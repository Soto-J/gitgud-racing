import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { trpc } from "@/trpc/server";
import { HydrateClient, prefetch } from "@/components/hydration-client";

import LeagueScheduleView from "@/modules/league-schedule/ui/views/league-schedule-view";

export default async function LeagueSchedulePage() {
  prefetch(trpc.leagueSchedule.getMany.queryOptions());

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
