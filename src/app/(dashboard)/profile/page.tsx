import { Suspense } from "react";
import { redirect } from "next/navigation";

import { ErrorBoundary } from "react-error-boundary";

import { trpc } from "@/trpc/server";
import { HydrateClient, prefetch } from "@/components/hydration-client";

import { getCurrentSession } from "@/lib/auth/utils/get-current-session";

import {
  ErrorProfileView,
  LoadingProfileView,
  ProfileView,
} from "@/modules/profile/ui/views/profile-view";

export default async function ProfilePage() {
  const session = await getCurrentSession();
  if (!session) redirect("/");

  const userId = session.user.id;

  prefetch(trpc.profile.getOneWithIracing.queryOptions({ userId }));

  return (
    <HydrateClient>
      <Suspense fallback={<LoadingProfileView />}>
        <ErrorBoundary fallback={<ErrorProfileView />}>
          <ProfileView userId={userId} />
        </ErrorBoundary>
      </Suspense>
    </HydrateClient>
  );
}
