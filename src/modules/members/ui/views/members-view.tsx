"use client";

import { useRouter } from "next/navigation";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

import { useMembersFilters } from "@/modules/members/hooks/use-members-filter";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { DataPagination } from "@/components/data-pagination";

import { DataTable } from "@/modules/members/ui/components/data-table";
import { columns } from "@/modules/members/ui/components/columns";

interface MembersViewProps {
  userId: string;
}

export const MembersView = ({ userId }: MembersViewProps) => {
  const [filters, setFilters] = useMembersFilters();
  const router = useRouter();

  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.members.getMany.queryOptions({ ...filters }),
  );

  return (
    <>
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <DataTable
          columns={columns}
          data={data.members}
          onRowClick={(original) =>
            userId === original.id
              ? router.push("/profile")
              : router.push(`/members/${original.id}`)
          }
        />
      </div>

      <DataPagination
        page={filters.page}
        totalPages={data.totalPages}
        onPageChange={(page) => setFilters({ page })}
      />

      <div className="mt-8 text-center">
        <p className="text-gray-500">
          Click any member to view their profile and racing stats
        </p>
      </div>
    </>
  );
};

export const LoadingMembersView = () => (
  <LoadingState title="Loading" description="This make take a few seconds" />
);
export const ErrorMembersView = () => (
  <ErrorState title="Error" description="Something went wrong" />
);
