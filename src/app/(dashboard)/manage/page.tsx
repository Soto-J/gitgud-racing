import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { SearchParams } from "nuqs";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient, trpc } from "@/trpc/server";

import { loadSearchParams } from "@/modules/manage/params";

import { auth } from "@/lib/auth";

import {
  ManageErrorPage,
  ManageLoadingPage,
  ManagePageView,
} from "@/modules/manage/ui/views/manage-page-view";

interface ManagePageProps {
  searchParams: Promise<SearchParams>;
}

const ManagePage = async ({ searchParams }: ManagePageProps) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/sign-in");
  }

  if (session.user?.role !== "admin" && session.user?.role !== "staff") {
    redirect("/");
  }

  const filters = await loadSearchParams(searchParams);

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.manage.getUsers.queryOptions({ ...filters }),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ManageLoadingPage />}>
        <ErrorBoundary fallback={<ManageErrorPage />}>
          <ManagePageView currentUserId={session.user.id}/>
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
};

export default ManagePage;
