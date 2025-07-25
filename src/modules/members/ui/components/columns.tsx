"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MemberGetOne } from "@/modules/members/types";

export const columns: ColumnDef<MemberGetOne>[] = [
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return <p>mock</p>;
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
      return <p>mock</p>;
    },
  },
  {
    accessorKey: "sRating",
    header: "SRating",
    cell: ({ row }) => {
      return <p>mock</p>;
    },
  },
  {
    accessorKey: "team",
    header: "Team",
    cell: ({ row }) => {
      return <p>mock</p>;
    },
  },
  {
    accessorKey: "discord",
    header: "Discord",
    cell: ({ row }) => {
      return <p>mock</p>;
    },
  },
];
