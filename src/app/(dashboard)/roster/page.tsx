import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ErrorBoundary } from "react-error-boundary";

import { SearchParams } from "nuqs";

import { trpc } from "@/trpc/server";
import { HydrateClient, prefetch } from "@/components/hydration-client";

import { getCurrentSession } from "@/lib/auth/utils/get-current-session";

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
  // const session = await getCurrentSession();
  // if (!session) redirect("/");

  const filters = await loadSearchParams(searchParams);
  prefetch(trpc.roster.getMany.queryOptions({ ...filters }));

  return (
    <HydrateClient>
      <Suspense fallback={<LoadingRosterView />}>
        <ErrorBoundary fallback={<ErrorRosterView />}>
          <RosterHeader />
          <RosterView />
        </ErrorBoundary>
      </Suspense>
    </HydrateClient>
  );
}
