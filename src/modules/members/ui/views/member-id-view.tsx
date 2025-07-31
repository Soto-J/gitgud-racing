"use client";

import { useTRPC } from "@/trpc/client";

import { useSuspenseQuery } from "@tanstack/react-query";

import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { ProfileCard } from "@/components/profile-card";

interface MemberIdViewProps {
  userId: string;
}
export const MemberIdView = ({ userId }: MemberIdViewProps) => {
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.profile.getOneOrCreate.queryOptions({ userId }),
  );

  return <ProfileCard profile={data} />;
};

export const LoadingMemberIdView = () => (
  <LoadingState title="Loading" description="This make take a few seconds" />
);
export const ErrorMemberIdView = () => (
  <ErrorState title="Error" description="Something went wrong" />
);
