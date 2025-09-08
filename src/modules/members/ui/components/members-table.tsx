"use client";

import { useRouter } from "next/navigation";
import { Crown } from "lucide-react";

import { cn } from "@/lib/utils";

import { GetMany } from "@/modules/members/server/procedures/get-many/schema";

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
          ? "bg-secondary/10 text-secondary border-secondary/20 border"
          : "bg-muted text-muted-foreground",
      )}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
};

interface MembersTableProps {
  members: GetMany["users"];
  loggedInUserId: string;
}

export const MembersTable = ({
  members,
  loggedInUserId,
}: MembersTableProps) => {
  const router = useRouter();

  return (
    <Card className="border-border from-primary bg-gradient-to-br to-black">
      <CardContent className="">
        <Table>
          <TableCaption className="text-muted-foreground">
            Complete roster of GitGud Racing community members.
          </TableCaption>

          <TableHeader>
            <TableRow className="border-border hover:bg-muted/50">
              <TableHead className="text-primary-foreground font-semibold">
                Member
              </TableHead>
              <TableHead className="text-primary-foreground font-semibold">
                Status
              </TableHead>
              <TableHead className="text-primary-foreground font-semibold">
                Role
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {members.map((member) => {
              const isAdmin =
                member.role === "admin" || member.role === "staff";

              return (
                <TableRow
                  key={member.id}
                  className="border-border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() =>
                    loggedInUserId === member.id
                      ? router.push(`/profile`)
                      : router.push(`/members/${member.id}`)
                  }
                >
                  <TableCell className="">
                    <div className="flex items-center gap-3">
                      <Avatar className="border-border h-8 w-8 border">
                        <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-semibold">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="text-accent">{member.name}</p>
                          <p className="text-muted text-xs">{member.email}</p>
                        </div>

                        {isAdmin && (
                          <Crown className="text-secondary h-4 w-4" />
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <StatusBadge
                      isActive={member.isActive}
                      banned={member.banned}
                    />
                  </TableCell>

                  <TableCell>
                    <span
                      className={cn(
                        "text-sm font-medium capitalize",
                        isAdmin
                          ? "text-secondary font-semibold"
                          : "text-muted-foreground",
                      )}
                    >
                      {member.role}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

MembersTable.displayName = "MembersTable";
