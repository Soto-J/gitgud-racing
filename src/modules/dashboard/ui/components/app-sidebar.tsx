import { redirect } from "next/navigation";

import { TRPCError } from "@trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient, trpc } from "@/trpc/server";

import { getSession } from "@/lib/auth/get-session";

import { DashboardMenu } from "./dashboard-menu";

export default async function AppSidebar() {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  const queryClient = getQueryClient();

  try {
    await queryClient.fetchQuery(trpc.iracing.getUserSummary.queryOptions());
  } catch (error) {
    if (error instanceof TRPCError && error.code === "UNAUTHORIZED") {
      redirect("/sign-in");
    }
    throw error;
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardMenu />
    </HydrationBoundary>
  );
}
