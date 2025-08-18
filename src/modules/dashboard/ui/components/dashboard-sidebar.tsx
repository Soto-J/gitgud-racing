import { getQueryClient, trpc } from "@/trpc/server";
import { DashboardMenu } from "./dashboard-menu";

export const DashboardSidebar = async () => {
  
  // const queryClient = getQueryClient();
  // void queryClient.prefetchQuery(trpc.iracing.getSeasons.queryOptions({}));
  return (
    <>
      <DashboardMenu />
    </>
  );
};
