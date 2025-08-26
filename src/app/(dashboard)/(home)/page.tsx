import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { SearchParams } from "nuqs";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient, trpc } from "@/trpc/server";

import { loadSearchParams } from "@/modules/home/params";

import { auth } from "@/lib/auth";

import {
  ErrorHomeView,
  HomeView,
  LoadingHomeView,
} from "@/modules/home/ui/views/home-view";

import { HomeHeader } from "@/modules/home/ui/components/home-header";

interface HomePageProps {
  searchParams: Promise<SearchParams>;
}

const HomePage = async ({ searchParams }: HomePageProps) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/sign-in");

  const filters = await loadSearchParams(searchParams);

  const queryClient = getQueryClient();

  void (await queryClient.prefetchQuery(
    trpc.iracing.weeklySeriesResults.queryOptions({ ...filters }),
  ));
  void (await queryClient.prefetchQuery(
    trpc.iracing.getTotalSeriesCount.queryOptions({ ...filters }),
  ));
  return (
    <>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <HomeHeader />
        
        <Suspense fallback={<LoadingHomeView />}>
          <ErrorBoundary fallback={<ErrorHomeView />}>
            <HomeView />
          </ErrorBoundary>
        </Suspense>
      </HydrationBoundary>
    </>
  );
};

export default HomePage;
