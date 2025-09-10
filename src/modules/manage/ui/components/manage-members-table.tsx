"use client";

import { Crown } from "lucide-react";

import { cn } from "@/lib/utils";

import { ManageUser } from "@/modules/manage/server/procedures/get-user/schema";

import { TableActions } from "@/modules/manage/ui/components/table/table-actions";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const StatusBadge = ({
  isActive,
  banned,
}: {
  isActive: boolean;
  banned?: boolean | null;
}) => {
  if (banned) {
    return (
      <span className="bg-destructive/10 text-destructive inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
        Banned
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        isActive
          ? "border border-green-400/20 bg-green-500/10 text-green-400"
          : "border border-red-400/20 bg-red-500/10 text-red-400",
      )}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
};

interface ManageMembersTableProps {
  members: ManageUser[];
  filters: {
    search: string;
    page: number;
    memberId: string;
  };
  confirmDelete: () => Promise<boolean>;
}

export const ManageMembersTable = ({
  members,
  filters,
  confirmDelete,
}: ManageMembersTableProps) => {
  return (
    <Card className="border-0 bg-black">
      <CardContent className="px-0">
        <Table className="bg-black text-white">
          <TableCaption className="text-zinc-400">
            Administrative management of GitGud Racing community members.
          </TableCaption>

          <TableHeader>
            <TableRow className="border-b border-zinc-800 hover:bg-zinc-900/50">
              <TableHead className="pl-6 font-semibold text-yellow-100">
                Member
              </TableHead>
              <TableHead className="text-center font-semibold text-yellow-100">
                Status
              </TableHead>
              <TableHead className="text-center font-semibold text-yellow-100">
                Role
              </TableHead>
              <TableHead className="pr-6 text-center font-semibold text-yellow-100">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {members.length ? (
              members.map((member, index) => {
                const isAdmin =
                  member.role === "admin" || member.role === "staff";

                return (
                  <TableRow
                    key={member.id}
                    className={`hover:bg-ferrari-dark-red/20 border-b border-zinc-800 transition-colors duration-150 ${
                      index % 2 === 0 ? "bg-zinc-900" : "bg-black"
                    }`}
                  >
                    <TableCell className="border-r border-zinc-800 p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border border-zinc-700">
                          <AvatarFallback className="bg-zinc-800 text-xs font-semibold text-yellow-100">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-medium text-yellow-100">
                              {member.name}
                            </p>
                            <p className="text-xs text-zinc-400">
                              {member.team ? `Team: ${member.team}` : "No team"}
                            </p>
                          </div>

                          {isAdmin && (
                            <Crown className="h-4 w-4 text-yellow-400" />
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="border-r border-zinc-800 p-4 text-center">
                      <StatusBadge
                        isActive={member.isActive}
                        banned={member.banned}
                      />
                    </TableCell>

                    <TableCell className="border-r border-zinc-800 p-4 text-center">
                      <span
                        className={cn(
                          "text-sm font-medium capitalize",
                          isAdmin
                            ? "font-semibold text-yellow-400"
                            : "text-zinc-300",
                        )}
                      >
                        {member.role}
                      </span>
                    </TableCell>

                    <TableCell className="p-4 text-center">
                      <TableActions
                        user={member}
                        filters={filters}
                        confirmDelete={confirmDelete}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center font-medium text-zinc-500"
                >
                  No members found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

ManageMembersTable.displayName = "ManageMembersTable";
