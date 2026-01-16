"use client";

import { useTRPC } from "@/trpc/client";

import { useSuspenseQueries } from "@tanstack/react-query";

import LoadingState from "@/components/loading-state";
import ErrorState from "@/components/error-state";
import Banner from "@/components/banner";
import Profile from "@/components/profile";

interface MemberIdViewProps {
  userId: string;
}
export const MemberIdView = ({ userId }: MemberIdViewProps) => {
  const trpc = useTRPC();

  const [userPayload, chartPayload] = useSuspenseQueries({
    queries: [
      trpc.iracing.getUser.queryOptions({ userId }),
      trpc.iracing.userChartData.queryOptions({ userId }),
    ],
  });

  return (
    <>
      <Banner
        section="IRacing Profile"
        title={userPayload.data.user?.name || ""}
        subTitle1="Professional Driver"
        subTitle2={userPayload.data?.profile?.isActive ? "Active" : "Inactive"}
      />

      <Profile iRacingInfo={chartPayload.data} contactInfo={userPayload.data} />
    </>
  );
};

export const LoadingMemberIdView = () => (
  <LoadingState title="Loading" description="This make take a few seconds" />
);
export const ErrorMemberIdView = () => (
  <ErrorState title="Error" description="Something went wrong" />
);
