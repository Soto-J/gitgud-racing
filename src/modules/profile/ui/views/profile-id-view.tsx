"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQueries } from "@tanstack/react-query";

import LoadingState from "@/components/loading-state";
import ErrorState from "@/components/error-state";
import Profile from "@/components/profile";

interface ProfileViewProps {
  userId: string;
}

export const ProfileIdView = ({ userId }: ProfileViewProps) => {
  const trpc = useTRPC();
  const [profilePayload, iracingPayload, chartPayload] = useSuspenseQueries({
    queries: [
      trpc.profile.getOne.queryOptions({ userId }),
      trpc.iracing.userLicenses.queryOptions({ userId }),
      trpc.iracing.userChartData.queryOptions({ userId }),
    ],
  });

  return (
    <Profile
      profilePayload={profilePayload.data}
      iracingPayload={iracingPayload.data}
      chartDataPoints={chartPayload.data}
    />
  );
};

export const LoadingProfileView = () => (
  <LoadingState title="Loading" description="This make take a few seconds" />
);
export const ErrorProfileView = () => (
  <ErrorState title="Error" description="Something went wrong" />
);
