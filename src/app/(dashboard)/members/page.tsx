import { Suspense } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { ErrorBoundary } from "react-error-boundary";

import { SearchParams } from "nuqs";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getQueryClient, trpc } from "@/trpc/server";

import { auth } from "@/lib/auth";

import { loadSearchParams } from "@/modules/members/params";

import {
  ErrorMembersView,
  LoadingMembersView,
  MembersView,
} from "@/modules/members/ui/views/members-view";

interface MembersPageProps {
  searchParams: Promise<SearchParams>;
}

const MembersPage = async ({ searchParams }: MembersPageProps) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/sign-in");

  const filters = await loadSearchParams(searchParams);

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.members.getMany.queryOptions({ ...filters }),
  );

  return (
    <>
      <div className="py-8 text-center">
        <h1 className="text-ferrari-dark-red mb-2 text-3xl font-bold">
          Git Gud Fam
        </h1>

        <p className="text-lg text-gray-600">Racing League Members</p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<LoadingMembersView />}>
          <ErrorBoundary fallback={<ErrorMembersView />}>
            <MembersView />
          </ErrorBoundary>
        </Suspense>
      </HydrationBoundary>
    </>
  );
};

export default MembersPage;
