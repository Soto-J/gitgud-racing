"use client";

import { Activity } from "react";

import { Crown } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

import { cn } from "@/lib/utils";

import { RosterUser } from "@/modules/roster/server/procedures/get-many/types";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const columns: ColumnDef<RosterUser>[] = [
  {
    accessorKey: "name",
    header: "Member",
    cell: ({ row }) => {
      const isAdmin =
        row.original.role === "admin" || row.original.role === "staff";

      return (
        <div className="flex items-center gap-3">
          <Avatar className="border-border h-8 w-8 border">
            <AvatarFallback className="text-secondary/70 bg-border text-xs font-semibold">
              {getInitials(row.original.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex items-center gap-2">
            <div>
              <p className="text-secondary/70 font-medium">
                {row.original.name}
              </p>
              <p className="text-muted-foreground text-xs">
                {row.original.email}
              </p>
            </div>

            <Activity mode={isAdmin ? "visible" : "hidden"}>
              <Crown className="text-secondary h-4 w-4" />
            </Activity>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "team",
    header: "Team",
    cell: ({ row }) => {
      return row.original.team || "Not provided";
    },
  },
  {
    accessorKey: "discord",
    header: "Discord",
    cell: ({ row }) => {
      return row.original.discord || "Not provided";
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const { isActive, banned } = row.original;

      if (banned) {
        return (
          <span className="bg-destructive/10 text-destructive border-destructive/20 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium">
            Banned
          </span>
        );
      }

      return (
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
            isActive
              ? "border-secondary/20 bg-secondary/10 text-secondary"
              : "border-destructive/20 bg-destructive/10 text-destructive",
          )}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const isAdmin =
        row.original.role === "admin" || row.original.role === "staff";

      return (
        <span
          className={cn(
            "text-sm font-medium capitalize",
            isAdmin ? "text-secondary font-semibold" : "text-muted-foreground",
          )}
        >
          {row.original.role}
        </span>
      );
    },
  },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
