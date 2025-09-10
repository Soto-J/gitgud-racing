"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

import { useConfirm } from "@/hooks/use-confirm";

import { useManageFilters } from "@/modules/manage/hooks/use-manage-filter";

import { ManageMembersTable } from "@/modules/manage/ui/components/manage-members-table";

import { DataPagination } from "@/components/data-pagination";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";

export const ManagePageView = () => {
  const [filters, setFilters] = useManageFilters();

  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.manage.getUsers.queryOptions({ ...filters }),
  );

  const [ConfirmationDialog, confirmDelete] = useConfirm({
    title: "Delete Member Account",
    description:
      "This will permanently remove the member and all associated data. This action cannot be undone.",
  });

  return (
    <>
      <ConfirmationDialog />

      <ManageMembersTable
        members={data.members}
        filters={filters}
        confirmDelete={confirmDelete}
      />

      <DataPagination
        page={filters.page}
        totalPages={data.totalPages}
        onPageChange={(page) => setFilters({ page })}
      />
    </>
  );
};

export const ManageLoadingPage = () => (
  <LoadingState title="Loading" description="This may take a few seconds." />
);
export const ManageErrorPage = () => (
  <ErrorState title="Error" description="Something went wrong" />
);
