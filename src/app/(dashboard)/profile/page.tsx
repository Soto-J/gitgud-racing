import { Suspense } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { ErrorBoundary } from "react-error-boundary";

import { auth } from "@/lib/auth";

import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import {
  ErrorProfileView,
  LoadingProfileView,
  ProfileView,
} from "@/modules/profile/ui/views/profile-view";

const ProfilePage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/sign-in");

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.iracing.getUser.queryOptions(
      { userId: session.user.id },
      { retry: false },
    ),
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
