import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { trpc } from "@/trpc/server";
import { HydrateClient, prefetch } from "@/components/hydration-client";

import type { SearchParams } from "nuqs";
import { loadSearchParams } from "@/modules/series-results/server/procedures/search-series-results/types/params";

import SeriesResultsHeader from "@/modules/series-results/ui/components/series-results-header";
import {
  ErrorSeriesResultsView,
  LoadingSeriesResultsView,
  SeriesResultsView,
} from "@/modules/series-results/ui/views/series-results-view";

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
            <SeriesResultsView />
          </ErrorBoundary>
        </Suspense>
      </HydrateClient>
    </>
  );
}
