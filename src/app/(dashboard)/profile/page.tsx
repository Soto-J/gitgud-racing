import { Suspense } from "react";
import { redirect } from "next/navigation";

import { ErrorBoundary } from "react-error-boundary";

import { getQueryClient, trpc } from "@/trpc/server";
import { HydrateClient } from "@/components/hydration-client";

import { getCurrentSession } from "@/lib/auth/utils/get-current-session";

import {
  ErrorProfileView,
  LoadingProfileView,
  ProfileView,
} from "@/modules/profile/ui/views/profile-view";

export default async function ProfilePage() {
  const session = await getCurrentSession();
  if (!session) redirect("/sign-in");

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.iracing.getUser.queryOptions({ userId: session.user.id }),
  );
  void queryClient.prefetchQuery(
    trpc.iracing.userChartData.queryOptions({ userId: session.user.id }),
  );
  return (
    <HydrateClient>
      <Suspense fallback={<LoadingProfileView />}>
        <ErrorBoundary fallback={<ErrorProfileView />}>
          <ProfileView userId={session.user.id} />
        </ErrorBoundary>
      </Suspense>
    </HydrateClient>
  );
}
