import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ErrorBoundary } from "react-error-boundary";

import { SearchParams } from "nuqs";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getQueryClient, trpc } from "@/trpc/server";

import { getSession } from "@/lib/get-session";

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
  const session = await getSession();
  if (!session) redirect("/sign-in");

  const filters = await loadSearchParams(searchParams);

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.roster.getMany.queryOptions({ ...filters }),
  );

  return (
    <>
      <RosterHeader />

      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<LoadingRosterView />}>
          <ErrorBoundary fallback={<ErrorRosterView />}>
            <RosterView loggedInUserId={session.user.id} />
          </ErrorBoundary>
        </Suspense>
      </HydrationBoundary>
    </>
  );
}
