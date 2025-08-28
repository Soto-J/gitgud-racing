"use client";

import { useTRPC } from "@/trpc/client";

import { useSuspenseQueries, useSuspenseQuery } from "@tanstack/react-query";

import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { ProfileCard } from "@/components/profile-card";
import { Banner } from "@/components/banner";

interface MemberIdViewProps {
  userId: string;
}
export const MemberIdView = ({ userId }: MemberIdViewProps) => {
  const trpc = useTRPC();

  const [userPayload, chartDataPayload] = useSuspenseQueries({
    queries: [
      trpc.iracing.getUser.queryOptions({ userId }),
      trpc.iracing.userChartData.queryOptions({ userId }),
    ],
  });

  return (
    <>
      <Banner
        section="Profile"
        title={userPayload.data?.member?.user?.name || ""}
        subTitle1="Professional Driver"
        subTitle2={
          userPayload.data.member.profile.isActive ? "Active" : "Inactive"
        }
      />
      <ProfileCard
        member={userPayload.data.member}
        chartData={chartDataPayload.data}
      />
    </>
  );
};

export const LoadingMemberIdView = () => (
  <LoadingState title="Loading" description="This make take a few seconds" />
);
export const ErrorMemberIdView = () => (
  <ErrorState title="Error" description="Something went wrong" />
);
