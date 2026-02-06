"use client";

import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

import { authClient } from "@/lib/auth/auth-client";
import { useRosterFilters } from "@/modules/roster/hooks/use-roster-filter";

import ErrorState from "@/components/error-state";
import LoadingState from "@/components/loading-state";
import DataPagination from "@/components/data-pagination";
import RosterTable from "@/modules/roster/ui/components/roster-table";
import { columns } from "@/modules/roster/ui/components/roster-table/columns";

interface RosterViewProps {
  currentUserId: string;
  isAdmin: boolean;
}

export const RosterView = ({ currentUserId, isAdmin }: RosterViewProps) => {
  const [filters, setFilters] = useRosterFilters();
  const router = useRouter();

  const trpc = useTRPC();
  const { data: roster } = useSuspenseQuery(
    trpc.roster.getMany.queryOptions({ ...filters }),
  );

  const onRowClick = (id: string) => {
    router.push(currentUserId === id ? "/profile" : `/profile/${id}`);
  };

  return (
    <>
      <RosterTable
        data={roster.users}
        columns={columns(isAdmin)}
        total={roster.total}
        totalActive={roster.totalActive}
        onRowClick={(original) => onRowClick(original.id)}
      />

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
