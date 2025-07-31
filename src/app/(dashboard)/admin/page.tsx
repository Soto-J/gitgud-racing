import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { SearchParams } from "nuqs";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient, trpc } from "@/trpc/server";

import { loadSearchParams } from "@/modules/members/params";

import { auth } from "@/lib/auth";

import {
  AdminErrorPage,
  AdminLoadingPage,
  AdminPageView,
} from "@/modules/admin/ui/views/admin-page-view";

interface AdminPageProps {
  searchParams: Promise<SearchParams>;
}

const AdminPage = async ({ searchParams }: AdminPageProps) => {
  const session = auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/sign-in");
  }

  const filters = await loadSearchParams(searchParams);

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.members.isAdmin.queryOptions());
  void queryClient.prefetchQuery(
    trpc.members.getMany.queryOptions({ ...filters }),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<AdminLoadingPage />}>
        <ErrorBoundary fallback={<AdminErrorPage />}>
          <AdminPageView />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
};

export default AdminPage;
