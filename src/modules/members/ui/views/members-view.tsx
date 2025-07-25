"use client";

import { useRouter } from "next/navigation";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

import { DataTable } from "@/modules/members/ui/components/data-table";
import { columns } from "@/modules/members/ui/components/columns";

export const MembersView = () => {
  const router = useRouter();

  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.members.getMany.queryOptions());

  return (
    <div className="p-4">
      <h2 className="pb-4 text-center text-xl font-medium">Git Gud Fam</h2>
      <DataTable
        columns={columns}
        data={data}
        onRowClick={(original) => router.push(`/members/${original.id}`)}
      />
    </div>
  );
};
