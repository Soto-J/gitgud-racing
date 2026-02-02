import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { SearchParams } from "nuqs";

import { trpc } from "@/trpc/server";
import { HydrateClient, prefetch } from "@/components/hydration-client";

import { loadSearchParams } from "@/modules/iracing/server/procedures/weekly-series-results/params";

import SeriesResultsHeader from "@/modules/series-results/ui/components/series-results-header";
import {
  ErrorSeriesResultsView,
  LoadingSeriesResultsView,
  SeriesResultsPageView,
} from "@/modules/series-results/ui/views/series-results-page-view";

interface SeriesResultsPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function SeriesResultsPage({
  searchParams,
}: SeriesResultsPageProps) {
  const filters = await loadSearchParams(searchParams);

  prefetch(trpc.seriesResults.searchSeriesResults.queryOptions({ ...filters }));

  return (
    <>
      <SeriesResultsHeader />

      <HydrateClient>
        <Suspense fallback={<LoadingSeriesResultsView />}>
          <ErrorBoundary fallback={<ErrorSeriesResultsView />}>
            <SeriesResultsPageView />
          </ErrorBoundary>
        </Suspense>
      </HydrateClient>
    </>
  );
}
