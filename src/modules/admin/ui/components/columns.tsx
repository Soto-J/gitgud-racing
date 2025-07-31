"use client";

import Link from "next/link";

import { ColumnDef } from "@tanstack/react-table";

import { MemberGetOne } from "@/modules/members/types";

import { Actions } from "./actions";

export const columns: ColumnDef<MemberGetOne>[] = [
  {
    accessorKey: "status",
    header: "Status",
    cell: () => {
      return (
        <span
          className={
            true ? "font-medium text-green-600" : "font-medium text-red-600"
          }
        >
          {true ? "Active" : "Inactive"}
        </span>
      );
    },
  },
  {
    accessorKey: "name",
    cell: ({ row }) => {
      return (
        <div className="cursor-pointer">
          <Link href={`/members/${row.original.id}`} className="capitalize">
            {row.original.name}
          </Link>
        </div>
      );
    },
  },
  {
    accessorKey: "manage",
    cell: ({ row, filters, confirmDelete }) => {
      return (
        <Actions
          userId={row.original.id}
          filters={filters}
          confirmDelete={confirmDelete}
        />
      );
    },
  },
];
