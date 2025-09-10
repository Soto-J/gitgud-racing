import { redirect } from "next/navigation";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient, trpc } from "@/trpc/server";

import { getSession } from "@/lib/get-session";

import { DashboardMenu } from "./dashboard-menu";

export const DashboardSidebar = async () => {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.iracing.getUserSummary.queryOptions());
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardMenu />
    </HydrationBoundary>
  );
};
