import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { SearchParams } from "nuqs";

import { trpc } from "@/trpc/server";
import { HydrateClient, prefetch } from "@/components/hydration-client";

import { loadSearchParams } from "@/modules/iracing/server/procedures/weekly-series-results/params";

import SeriesStatsHeader from "@/modules/series-stats/ui/components/series-stats-header";
import {
  ErrorHomeView,
  LoadingHomeView,
  SeriesResultsPageView,
} from "@/modules/series-stats/ui/views/series-results-page-view";

import UnderConstruction from "@/components/under-construction";

interface SeriesResultsPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function SeriesResultsPage({
  searchParams,
}: SeriesResultsPageProps) {
  const filters = await loadSearchParams(searchParams);

  // prefetch(trpc.iracing.weeklySeriesResults.queryOptions({ ...filters }));
  // prefetch(trpc.seriesStats.totalSeriesCount.queryOptions({ ...filters }));
  // prefetch(trpc.seriesResults.resultsSearchSeries.queryOptions({}));

  return (
    <HydrateClient>
      <Suspense fallback={<LoadingHomeView />}>
        <ErrorBoundary fallback={<ErrorHomeView />}>
          {/* <SeriesStatsHeader /> */}
          {/* <SeriesResultsPageView /> */}
          <UnderConstruction
            title="Series Stats view"
            message="Working on an amazing page for you!"
          />
        </ErrorBoundary>
      </Suspense>
    </HydrateClient>
  );
}
