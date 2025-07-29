"use client";

import { useTRPC } from "@/trpc/client";

import { ProfileCard } from "@/components/profile-card";
import { useSuspenseQuery } from "@tanstack/react-query";

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
