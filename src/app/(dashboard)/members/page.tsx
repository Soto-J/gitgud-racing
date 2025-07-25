import { Suspense } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { ErrorBoundary } from "react-error-boundary";

import { auth } from "@/lib/auth";

import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { MembersView } from "@/modules/members/ui/views/members-view";

const MembersPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/sign-in");

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.members.getMany.queryOptions());
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<p>Loading</p>}>
        <ErrorBoundary fallback={<p></p>}>
          <MembersView />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
};

export default MembersPage;
