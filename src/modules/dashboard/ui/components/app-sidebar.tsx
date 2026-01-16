import { redirect } from "next/navigation";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient, trpc } from "@/trpc/server";

import { getSession } from "@/lib/get-session";

import { DashboardMenu } from "./dashboard-menu";

export default async function AppSidebar() {
  const session = await getSession();
  console.log("Session: ", session);
  if (!session) redirect("/sign-in");

  const queryClient = getQueryClient();

  // const { isConnected } = await queryClient.fetchQuery(
  //   trpc.authProviders.hasIracingConnection.queryOptions(),
  // );

  // if (!isConnected) {
  //   return <div>Connect via Iracing</div>;
  // }

  void queryClient.prefetchQuery(trpc.iracing.getUserSummary.queryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardMenu />
    </HydrationBoundary>
  );
}
