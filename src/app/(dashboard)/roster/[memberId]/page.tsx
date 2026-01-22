import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/auth/utils/get-current-session";

import { trpc } from "@/trpc/server";

import { HydrateClient, prefetch } from "@/components/hydration-client";
import {
  ErrorMemberIdView,
  LoadingMemberIdView,
  MemberIdView,
} from "@/modules/roster/ui/views/member-id-view";
import UnderConstruction from "@/components/under-construction";

interface MemberIdPageProps {
  params: Promise<{ memberId: string }>;
}

export default async function MemberIdPage({ params }: MemberIdPageProps) {
  const session = await getCurrentSession();
  if (!session) redirect("/");

  const { memberId } = await params;

  // prefetch(trpc.iracing.getUser.queryOptions({ userId: memberId }));
  // prefetch(
  //   trpc.iracing.userChartData.queryOptions({ userId: session.user.id }),
  // );
  return (
    <HydrateClient>
      <Suspense fallback={<LoadingMemberIdView />}>
        <ErrorBoundary fallback={<ErrorMemberIdView />}>
          <UnderConstruction
            title="Member ID view"
            message="Working on an amazing page for you!"
          />
          {/* <MemberIdView userId={memberId} /> */}
        </ErrorBoundary>
      </Suspense>
    </HydrateClient>
  );
}
