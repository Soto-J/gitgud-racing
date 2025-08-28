import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import {
  ErrorMemberIdView,
  LoadingMemberIdView,
  MemberIdView,
} from "@/modules/members/ui/views/member-id-view";

interface MemberIdPageProps {
  params: Promise<{ memberId: string }>;
}

const MemberIdPage = async ({ params }: MemberIdPageProps) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const { memberId } = await params;

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.iracing.getUser.queryOptions({ userId: memberId }),
  );
  void queryClient.prefetchQuery(
    trpc.iracing.userChartData.queryOptions({ userId: session.user.id }),
  );
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<LoadingMemberIdView />}>
        <ErrorBoundary fallback={<ErrorMemberIdView />}>
          <MemberIdView userId={memberId} />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
};

export default MemberIdPage;
