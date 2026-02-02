import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { trpc } from "@/trpc/server";
import { HydrateClient, prefetch } from "@/components/hydration-client";

import { SearchParams } from "nuqs";
import { loadSearchParams } from "@/modules/roster/server/procedures/get-many/params";

import RosterHeader from "@/modules/roster/ui/components/roster-header";

import {
  ErrorRosterView,
  LoadingRosterView,
  RosterView,
} from "@/modules/roster/ui/views/roster-view";

interface RosterPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function RosterPage({ searchParams }: RosterPageProps) {
  const filters = await loadSearchParams(searchParams);

  prefetch(trpc.roster.getMany.queryOptions({ ...filters }));

  return (
    <>
      <RosterHeader />

      <HydrateClient>
        <Suspense fallback={<LoadingRosterView />}>
          <ErrorBoundary fallback={<ErrorRosterView />}>
            <RosterView />
          </ErrorBoundary>
        </Suspense>
      </HydrateClient>
    </>
  );
}
