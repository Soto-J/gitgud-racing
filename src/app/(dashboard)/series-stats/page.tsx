import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { redirect } from "next/navigation";

import { SearchParams } from "nuqs";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient, trpc } from "@/trpc/server";

import { loadSearchParams } from "@/modules/iracing/server/procedures/weekly-series-results/params";

import { getSession } from "@/lib/get-session";

import { SeriesStatsHeader } from "@/modules/series-stats/ui/components/series-stats-header";
import {
  ErrorHomeView,
  LoadingHomeView,
  SeriesStatsPageView,
} from "@/modules/series-stats/ui/views/series-stats-page-view";

interface HomePageProps {
  searchParams: Promise<SearchParams>;
}

const SeriesStatsPage = async ({ searchParams }: HomePageProps) => {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  const filters = await loadSearchParams(searchParams);

  const queryClient = getQueryClient();

  void (await queryClient.prefetchQuery(
    trpc.iracing.weeklySeriesResults.queryOptions({ ...filters }),
  ));
  void (await queryClient.prefetchQuery(
    trpc.seriesStats.totalSeriesCount.queryOptions({ ...filters }),
  ));
  return (
    <>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <SeriesStatsHeader />

        <Suspense fallback={<LoadingHomeView />}>
          <ErrorBoundary fallback={<ErrorHomeView />}>
            <SeriesStatsPageView />
          </ErrorBoundary>
        </Suspense>
      </HydrationBoundary>
    </>
  );
};

export default SeriesStatsPage;
