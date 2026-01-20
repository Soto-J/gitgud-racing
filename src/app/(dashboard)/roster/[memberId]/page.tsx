import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/auth/utils/get-current-session";

import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import {
  ErrorMemberIdView,
  LoadingMemberIdView,
  MemberIdView,
} from "@/modules/roster/ui/views/member-id-view";

interface MemberIdPageProps {
  params: Promise<{ memberId: string }>;
}

export default async function MemberIdPage({ params }: MemberIdPageProps) {
  const session = await getCurrentSession();
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
}
