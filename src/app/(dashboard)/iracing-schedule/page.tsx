import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { SearchParams } from "nuqs";

import { trpc } from "@/trpc/server";
import { HydrateClient, prefetch } from "@/components/hydration-client";

import { loadSearchParams } from "@/modules/manage/server/procedures/get-users/params";

import { getCurrentSession } from "@/lib/auth/utils/get-current-session";

import ManageListHeader from "@/modules/manage/ui/components/manage-list-header";

import {
  ManageErrorPage,
  ManageLoadingPage,
  ManagePageView,
} from "@/modules/manage/ui/views/manage-page-view";
import IracingScheduleView from "@/modules/iracing-schedule/ui/views/iracing-schedule-view";

interface IracingScheduleProps {
  searchParams: Promise<SearchParams>;
}

export default async function IracingSchedule({
  searchParams,
}: IracingScheduleProps) {
  const session = await getCurrentSession();
  if (!session) redirect("/");

  if (session.user?.role !== "admin" && session.user?.role !== "staff") {
    redirect("/");
  }

  const filters = await loadSearchParams(searchParams);

  prefetch(trpc.manage.getUsers.queryOptions({ ...filters }));

  return (
    <>
      <ManageListHeader />

      <HydrateClient>
        <Suspense fallback={<ManageLoadingPage />}>
          <ErrorBoundary fallback={<ManageErrorPage />}>
            <IracingScheduleView />
          </ErrorBoundary>
        </Suspense>
      </HydrateClient>
    </>
  );
}
