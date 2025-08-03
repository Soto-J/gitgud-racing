"use client";

import Link from "next/link";

import { ColumnDef } from "@tanstack/react-table";

import { Actions } from "./actions";
import { AdminGetUser } from "../../types";

export const columns: ColumnDef<AdminGetUser>[] = [
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
          user={row.original}
          filters={filters}
          confirmDelete={confirmDelete}
        />
      );
    },
  },
];
