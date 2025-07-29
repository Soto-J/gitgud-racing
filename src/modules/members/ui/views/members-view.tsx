"use client";

import { useRouter } from "next/navigation";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

import { useMembersFilters } from "@/modules/members/hooks/use-members-filter";

import { LoadingState } from "@/components/loading-state";
import { DataTable } from "@/modules/members/ui/components/data-table";
import { columns } from "@/modules/members/ui/components/columns";
import { DataPagination } from "@/components/data-pagination";

export const MembersView = () => {
  const [filters, setFilters] = useMembersFilters();
  const router = useRouter();

  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.members.getMany.queryOptions({ ...filters }),
  );

  return (
    <div className="px-6">
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <DataTable
          columns={columns}
          data={data.members}
          onRowClick={(original) => router.push(`/members/${original.id}`)}
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
    </div>
  );
};

export const LoadingMembersView = () => (
  <LoadingState title="Loading" description="This make take a few seconds" />
);
export const ErrorMembersView = () => (
  <LoadingState title="Error" description="Something went wrong" />
);
