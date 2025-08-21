import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { SearchParams } from "nuqs";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient, trpc } from "@/trpc/server";

import { loadSearchParams } from "@/modules/home/params";

import { auth } from "@/lib/auth";

import { HomeView } from "@/modules/home/ui/views/home-view";
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
  return (
    <>
      <HomeHeader />

      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<p>Loading</p>}>
          <ErrorBoundary fallback={<p>Error</p>}>
            <HomeView />
          </ErrorBoundary>
        </Suspense>
      </HydrationBoundary>
    </>
  );
};

export default HomePage;
