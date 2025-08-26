"use client";

import Link from "next/link";

import { ColumnDef } from "@tanstack/react-table";

import { AdminGetUser } from "@/modules/manage/types";

import { TableActions } from "@/modules/manage/ui/components/table/table-actions";
import { Crown } from "lucide-react";

export const columns: ColumnDef<AdminGetUser>[] = [
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span
        className={
          row.original.isActive
            ? "font-medium text-green-600"
            : "font-medium text-red-600"
        }
      >
        {row.original.isActive ? "Active" : "Inactive"}
      </span>
    ),
  },
  {
    accessorKey: "name",
    cell: ({ row }) => {
      const isAdmin =
        row.original.role === "admin" || row.original.role === "staff";

      return (
        <div className="cursor-pointer">
          <Link
            href={`/members/${row.original.id}`}
            className="flex items-center justify-center gap-x-2 capitalize"
          >
            {isAdmin && <Crown key="crown" size={12} />}
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
        <TableActions
          user={row.original}
          filters={filters}
          confirmDelete={confirmDelete}
        />
      );
    },
  },
];
