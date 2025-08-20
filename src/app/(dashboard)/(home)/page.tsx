import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient, trpc } from "@/trpc/server";

import { auth } from "@/lib/auth";

import { useChartDataFilters } from "@/modules/home/hooks/use-chart-data-filter";

import { HomeView } from "@/modules/home/ui/views/home-view";

const DashboardPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  const [filters, _] = useChartDataFilters();
  
  if (!session) redirect("/sign-in");

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.iracing.weeklySeriesResults.queryOptions({ ...filters }),
  );
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<p>Loading</p>}>
        <ErrorBoundary fallback={<p>Error</p>}>
          <HomeView />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
};

export default DashboardPage;
