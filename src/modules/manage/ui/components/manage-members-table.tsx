"use client";

import { Crown } from "lucide-react";

import { cn } from "@/lib/utils";

import { AdminGetUser } from "@/modules/manage/types";

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
          ? "bg-green-500/10 text-green-400 border-green-400/20 border"
          : "bg-red-500/10 text-red-400 border-red-400/20 border",
      )}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
};

interface ManageMembersTableProps {
  members: AdminGetUser[];
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
    <div className="overflow-hidden rounded-lg border border-zinc-700 bg-black shadow-lg">
      <Card className="border-0 bg-black">
        <CardContent className="p-0">
          <Table className="bg-black text-white">
            <TableCaption className="text-zinc-400 py-4">
              Administrative management of GitGud Racing community members.
            </TableCaption>

            <TableHeader>
              <TableRow className="border-b border-zinc-800 hover:bg-zinc-900/50">
                <TableHead className="text-yellow-100 font-semibold pl-6">
                  Member
                </TableHead>
                <TableHead className="text-yellow-100 font-semibold text-center">
                  Status
                </TableHead>
                <TableHead className="text-yellow-100 font-semibold text-center">
                  Role
                </TableHead>
                <TableHead className="text-yellow-100 font-semibold text-center pr-6">
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
                          <Avatar className="border-zinc-700 h-8 w-8 border">
                            <AvatarFallback className="bg-zinc-800 text-yellow-100 text-xs font-semibold">
                              {getInitials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="text-yellow-100 font-medium">{member.name}</p>
                              <p className="text-zinc-400 text-xs">
                                {member.team ? `Team: ${member.team}` : "No team"}
                              </p>
                            </div>

                            {isAdmin && (
                              <Crown className="text-yellow-400 h-4 w-4" />
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
                              ? "text-yellow-400 font-semibold"
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
    </div>
  );
};

ManageMembersTable.displayName = "ManageMembersTable";