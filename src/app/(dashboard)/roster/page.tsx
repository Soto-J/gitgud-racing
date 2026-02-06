import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { trpc } from "@/trpc/server";
import { HydrateClient, prefetch } from "@/components/hydration-client";

import { SearchParams } from "nuqs";
import { loadSearchParams } from "@/modules/roster/server/procedures/get-many/params";

import { getCurrentSession } from "@/lib/auth/utils/get-current-session";

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
  const session = await getCurrentSession();

  if (!session?.user.id) redirect("/");

  prefetch(trpc.roster.getMany.queryOptions({ ...filters }));

  const isAdmin =
    session.user.role === "admin" || session.user.role === "staff";

  return (
    <>
      <RosterHeader />

      <HydrateClient>
        <Suspense fallback={<LoadingRosterView />}>
          <ErrorBoundary fallback={<ErrorRosterView />}>
            <RosterView currentUserId={session.user.id} isAdmin={isAdmin} />
          </ErrorBoundary>
        </Suspense>
      </HydrateClient>
    </>
  );
}
