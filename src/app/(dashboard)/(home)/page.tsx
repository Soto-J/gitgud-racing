import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";

import { HomeView } from "@/modules/home/ui/views/home-view";
import { getQueryClient, trpc } from "@/trpc/server";

const DashboardPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/sign-in");

  // const queryClient = getQueryClient();
  // void queryClient.prefetchQuery(trpc.iracing.getDocumentation.queryOptions());
  return <HomeView />;
};

export default DashboardPage;
