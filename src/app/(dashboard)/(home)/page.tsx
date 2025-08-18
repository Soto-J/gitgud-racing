import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";

import { HomeView } from "@/modules/home/ui/views/home-view";
import { getQueryClient, trpc } from "@/trpc/server";

const DashboardPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/sign-in");

  const queryOptions = {
    season_year: "2025",
    season_quarter: "4",
  };

  // const queryClient = getQueryClient();
  // void queryClient.prefetchQuery(
  //   trpc.iracing.getSeriesResults.queryOptions({ ...queryOptions }),
  // );
  return <HomeView queryOptions={queryOptions} />;
};

export default DashboardPage;
