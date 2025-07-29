import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import { MemberIdView } from "@/modules/members/ui/views/member-id-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

interface MemberIdPageProps {
  params: Promise<{ memberId: string }>;
}

const MemberIdPage = async ({ params }: MemberIdPageProps) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const { memberId } = await params;

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.profile.getOneOrCreate.queryOptions({ userId: memberId }),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MemberIdView userId={memberId} />
    </HydrationBoundary>
  );
};

export default MemberIdPage;
