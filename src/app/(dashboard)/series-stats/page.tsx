import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { redirect } from "next/navigation";

import { SearchParams } from "nuqs";

import { trpc } from "@/trpc/server";
import { HydrateClient, prefetch } from "@/components/hydration-client";

import { loadSearchParams } from "@/modules/iracing/server/procedures/weekly-series-results/params";

import { getCurrentSession } from "@/lib/auth/utils/get-current-session";

import SeriesStatsHeader from "@/modules/series-stats/ui/components/series-stats-header";
import {
  ErrorHomeView,
  LoadingHomeView,
  SeriesStatsPageView,
} from "@/modules/series-stats/ui/views/series-stats-page-view";

interface HomePageProps {
  searchParams: Promise<SearchParams>;
}

export default async function SeriesStatsPage({ searchParams }: HomePageProps) {
  const session = await getCurrentSession();
  if (!session) redirect("/sign-in");

  const filters = await loadSearchParams(searchParams);

  prefetch(trpc.iracing.weeklySeriesResults.queryOptions({ ...filters }));
  prefetch(trpc.seriesStats.totalSeriesCount.queryOptions({ ...filters }));

  return (
    <>
      <HydrateClient>
        <SeriesStatsHeader />

        <Suspense fallback={<LoadingHomeView />}>
          <ErrorBoundary fallback={<ErrorHomeView />}>
            <SeriesStatsPageView />
          </ErrorBoundary>
        </Suspense>
      </HydrateClient>
    </>
  );
}
