import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getQueryClient, trpc } from "@/trpc/server";

import { auth } from "@/lib/auth";

import { DashboardMenu } from "./dashboard-menu";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

export const DashboardSidebar = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/sign-in");

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.iracing.getUserSummary.queryOptions());
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardMenu />
    </HydrationBoundary>
  );
};
