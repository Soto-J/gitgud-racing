"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

import { useConfirm } from "@/hooks/use-confirm";

import { useMembersFilters } from "@/modules/admin/hooks/use-members-filter";

import { DataTable } from "@/modules/admin/ui/components/table/data-table";
import { columns } from "@/modules/admin/ui/components/table/columns";

import { DataPagination } from "@/components/data-pagination";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";

export const AdminPageView = () => {
  const [filters, setFilters] = useMembersFilters();

  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.admin.getUsers.queryOptions({ ...filters }),
  );

  const [ConfirmationDialog, confirmDelete] = useConfirm({
    title: "Delete Member Account",
    description:
      "This will permanently remove the member and all associated data. This action cannot be undone.",
  });

  return (
    <>
      <ConfirmationDialog />

      <div className="flex h-svh flex-col items-center justify-center">
        <DataTable
          data={data.members}
          columns={columns}
          filters={filters}
          confirmDelete={confirmDelete}
        />

        <DataPagination
          page={filters.page}
          totalPages={data.totalPages}
          onPageChange={(page) => setFilters({ page })}
        />
      </div>
    </>
  );
};

export const AdminLoadingPage = () => (
  <LoadingState title="Loading" description="This may take a few seconds." />
);
export const AdminErrorPage = () => (
  <ErrorState title="Error" description="Something went wrong" />
);
