import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/auth/utils/get-current-session";

import { trpc } from "@/trpc/server";

import { HydrateClient, prefetch } from "@/components/hydration-client";
import { ProfileIdView } from "@/modules/profile/ui/views/profile-id-view";
import {
  ErrorProfileView,
  LoadingProfileView,
} from "@/modules/profile/ui/views/profile-view";

interface ProfileIdPageProps {
  params: Promise<{ userId: string }>;
}

export default async function ProfileIdPage({ params }: ProfileIdPageProps) {
  const session = await getCurrentSession();
  if (!session) redirect("/");

  const { userId } = await params;

  prefetch(trpc.profile.getOne.queryOptions({ userId }));
  prefetch(trpc.iracing.userChartData.queryOptions({ userId }));
  return (
    <HydrateClient>
      <Suspense fallback={<LoadingProfileView />}>
        <ErrorBoundary fallback={<ErrorProfileView />}>
          <ProfileIdView userId={userId} />
        </ErrorBoundary>
      </Suspense>
    </HydrateClient>
  );
}
