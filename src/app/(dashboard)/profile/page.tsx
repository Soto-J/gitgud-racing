import { Suspense } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { ErrorBoundary } from "react-error-boundary";

import { auth } from "@/lib/auth";

import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { ProfileView } from "@/modules/profile/ui/views/profile-view";

const ProfilePage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/sign-in");

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.profile.getOne.queryOptions({ userId: session.user.id }),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<p>Loading</p>}>
        <ErrorBoundary fallback={<p>Error</p>}>
          <ProfileView userId={session.user.id} />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
};

export default ProfilePage;
