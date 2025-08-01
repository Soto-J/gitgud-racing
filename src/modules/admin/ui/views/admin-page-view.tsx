"use client";

import { useRouter } from "next/navigation";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

import { useConfirm } from "@/hooks/use-confirm";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";

import { DataTable } from "@/modules/admin/ui/components/data-table";
import { columns } from "@/modules/admin/ui/components/columns";

import { DataPagination } from "@/components/data-pagination";

import { useMembersFilters } from "@/modules/members/hooks/use-members-filter";

export const AdminPageView = () => {
  const [filters, setFilters] = useMembersFilters();

  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.members.getMany.queryOptions({ ...filters }),
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
