import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { SearchParams } from "nuqs";

import { getQueryClient, trpc } from "@/trpc/server";
import { HydrateClient } from "@/components/hydration-client";

import { loadSearchParams } from "@/modules/manage/server/procedures/get-users/params";

import { getCurrentSession } from "@/lib/auth/get-current-session";

import ManageListHeader from "@/modules/manage/ui/components/manage-list-header";

import {
  ManageErrorPage,
  ManageLoadingPage,
  ManagePageView,
} from "@/modules/manage/ui/views/manage-page-view";

interface ManagePageProps {
  searchParams: Promise<SearchParams>;
}

export default async function ManagePage({ searchParams }: ManagePageProps) {
  const session = await getCurrentSession();
  if (!session) redirect("/sign-in");

  if (session.user?.role !== "admin" && session.user?.role !== "staff") {
    redirect("/");
  }

  const filters = await loadSearchParams(searchParams);

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.manage.getUsers.queryOptions({ ...filters }),
  );

  return (
    <>
      <ManageListHeader />

      <HydrateClient>
        <Suspense fallback={<ManageLoadingPage />}>
          <ErrorBoundary fallback={<ManageErrorPage />}>
            <ManagePageView />
          </ErrorBoundary>
        </Suspense>
      </HydrateClient>
    </>
  );
}
