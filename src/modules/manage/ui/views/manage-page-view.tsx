"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

import { useConfirm } from "@/hooks/use-confirm";

import { useMembersFilters } from "@/modules/manage/hooks/use-members-filter";

import { DataTable } from "@/modules/manage/ui/components/table/data-table";
import { columns } from "@/modules/manage/ui/components/table/columns";

import { DataPagination } from "@/components/data-pagination";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useRouter } from "next/navigation";

interface ManagePageViewProps {
  currentUserId: string;
}

export const ManagePageView = ({ currentUserId }: ManagePageViewProps) => {
  const [filters, setFilters] = useMembersFilters();
  const router = useRouter();

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

export const ManageLoadingPage = () => (
  <LoadingState title="Loading" description="This may take a few seconds." />
);
export const ManageErrorPage = () => (
  <ErrorState title="Error" description="Something went wrong" />
);
