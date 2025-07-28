"use client";

import { useRouter } from "next/navigation";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

import { DataTable } from "@/modules/members/ui/components/data-table";
import { columns } from "@/modules/members/ui/components/columns";
import { DataPagination } from "@/components/data-pagination";
import { LoadingState } from "@/components/loading-state";

export const MembersView = () => {
  const router = useRouter();

  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.members.getMany.queryOptions());

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="mb-8 text-center">
        <h1 className="text-ferrari-dark-red mb-2 text-3xl font-bold">
          Git Gud Fam
        </h1>

        <p className="text-lg text-gray-600">Racing League Members</p>
      </div>

      {/* DataTable Container */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <DataTable
          columns={columns}
          data={data}
          onRowClick={(original) => router.push(`/members/${original.id}`)}
        />
      </div>
      <DataPagination page={1} totalPages={0} onPageChange={() => {}} />

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
