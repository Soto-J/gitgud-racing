import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { redirect } from "next/navigation";

import { trpc } from "@/trpc/server";

import { getCurrentSession } from "@/lib/auth/utils/get-current-session";

import LeagueScheduleView from "@/modules/league-schedule/ui/views/league-schedule-view";
import { HydrateClient, prefetch } from "@/components/hydration-client";

export default async function LeagueSchedulePage() {
  const session = await getCurrentSession();
  if (!session) redirect("/");

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
