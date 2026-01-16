"use client";

import { Crown } from "lucide-react";

import { ColumnDef } from "@tanstack/react-table";

import { cn } from "@/lib/utils";

import { User } from "@/modules/roster/server/procedures/get-one/schema";

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      return (
        <span
          className={cn(
            row.original.isActive
              ? "font-medium text-green-600"
              : "font-medium text-red-600",
          )}
        >
          {row.original.isActive ? "Active" : "Inactive"}
        </span>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const isAdmin =
        row.original.role === "admin" || row.original.role === "staff";

      return (
        <div className="flex items-center justify-center gap-x-2">
          {isAdmin && <Crown size={12} />}
          {row.original.name}
        </div>
      );
    },
  },
  {
    accessorKey: "team",
    header: "Team",
    cell: ({ row }) => {
      return <p className="text-gray-400 italic">N/A</p>;
    },
  },
];
