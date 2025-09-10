import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { SearchParams } from "nuqs";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient, trpc } from "@/trpc/server";

import { loadSearchParams } from "@/modules/manage/server/procedures/get-users/params";

import { getSession } from "@/lib/get-session";

import {
  ManageErrorPage,
  ManageLoadingPage,
  ManagePageView,
} from "@/modules/manage/ui/views/manage-page-view";
import { ManageListHeader } from "@/modules/manage/ui/components/manage-list-header";

interface ManagePageProps {
  searchParams: Promise<SearchParams>;
}

const ManagePage = async ({ searchParams }: ManagePageProps) => {
  const session = await getSession();
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

      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<ManageLoadingPage />}>
          <ErrorBoundary fallback={<ManageErrorPage />}>
            <ManagePageView />
          </ErrorBoundary>
        </Suspense>
      </HydrationBoundary>
    </>
  );
};

export default ManagePage;
