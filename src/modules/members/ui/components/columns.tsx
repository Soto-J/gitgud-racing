"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MemberGetOne } from "@/modules/members/types";

export const columns: ColumnDef<MemberGetOne>[] = [
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
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
    header: "Name",
    cell: ({ row }) => {
      return <p className="">{row.original.name}</p>;
    },
  },
  {
    accessorKey: "iRating",
    header: "IRating",
    cell: ({ row }) => {
      return <p className="text-gray-400 italic">N/A</p>;
    },
  },
  {
    accessorKey: "sRating",
    header: "SRating",
    cell: ({ row }) => {
      return <p className="text-gray-400 italic">N/A</p>;
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
