"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

import { useMembersFilters } from "@/modules/members/hooks/use-members-filter";

import ErrorState from "@/components/error-state";
import LoadingState from "@/components/loading-state";
import DataPagination from "@/components/data-pagination";

import { MembersTable } from "@/modules/members/ui/components/members-table";

interface MembersViewProps {
  loggedInUserId: string;
}

export const MembersView = ({ loggedInUserId }: MembersViewProps) => {
  const [filters, setFilters] = useMembersFilters();

  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.members.getMany.queryOptions({ ...filters }),
  );

  return (
    <>
      <MembersTable members={data.users} loggedInUserId={loggedInUserId} />

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
