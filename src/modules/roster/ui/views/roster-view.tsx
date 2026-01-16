"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

import { useMembersFilters } from "@/modules/roster/hooks/use-members-filter";

import ErrorState from "@/components/error-state";
import LoadingState from "@/components/loading-state";
import DataPagination from "@/components/data-pagination";

import { RosterTable } from "@/modules/roster/ui/components/roster-table";

interface RosterViewProps {
  loggedInUserId: string;
}

export const RosterView = ({ loggedInUserId }: RosterViewProps) => {
  const [filters, setFilters] = useMembersFilters();

  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.roster.getMany.queryOptions({ ...filters }),
  );

  return (
    <>
      <RosterTable members={data.users} loggedInUserId={loggedInUserId} />

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

export const LoadingRosterView = () => (
  <LoadingState title="Loading" description="This make take a few seconds" />
);
export const ErrorRosterView = () => (
  <ErrorState title="Error" description="Something went wrong" />
);
