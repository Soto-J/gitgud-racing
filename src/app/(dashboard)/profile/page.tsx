import { Suspense } from "react";
import { redirect } from "next/navigation";

import { ErrorBoundary } from "react-error-boundary";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient, trpc } from "@/trpc/server";

import { getSession } from "@/lib/get-session";

import {
  ErrorProfileView,
  LoadingProfileView,
  ProfileView,
} from "@/modules/profile/ui/views/profile-view";

const ProfilePage = async () => {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.iracing.getUser.queryOptions({ userId: session.user.id }),
  );
  void queryClient.prefetchQuery(
    trpc.iracing.userChartData.queryOptions({ userId: session.user.id }),
  );
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<LoadingProfileView />}>
        <ErrorBoundary fallback={<ErrorProfileView />}>
          <ProfileView userId={session.user.id} />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
};

export default ProfilePage;
