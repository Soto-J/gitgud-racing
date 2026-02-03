"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

import LoadingState from "@/components/loading-state";
import ErrorState from "@/components/error-state";
import Profile from "@/modules/profile/ui/components/profile";

interface ProfileViewProps {
  userId: string;
}

export const ProfileIdView = ({ userId }: ProfileViewProps) => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.profile.getOneWithIracing.queryOptions({ userId }),
  );

  return <Profile data={data} />;
};

export const LoadingProfileView = () => (
  <LoadingState title="Loading" description="This make take a few seconds" />
);
export const ErrorProfileView = () => (
  <ErrorState title="Error" description="Something went wrong" />
);
