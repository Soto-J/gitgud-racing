"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

import { useRosterFilters } from "@/modules/roster/hooks/use-roster-filter";

import ErrorState from "@/components/error-state";
import LoadingState from "@/components/loading-state";
import DataPagination from "@/components/data-pagination";
import RosterTable from "@/modules/roster/ui/components/roster-table";

export const RosterView = () => {
  const [filters, setFilters] = useRosterFilters();

  const trpc = useTRPC();
  const { data: roster } = useSuspenseQuery(
    trpc.roster.getMany.queryOptions({ ...filters }),
  );

  return (
    <>
      <RosterTable roster={roster} />

      <DataPagination
        page={filters.page}
        totalPages={roster.totalPages}
        onPageChange={(page) => setFilters({ page })}
      />

      <div className="pt-6 text-center">
        <p className="text-muted-foreground/70">
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
