import { Activity } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

import { Crown } from "lucide-react";
import { authClient } from "@/lib/auth/auth-client";
import type { RosterGetMany } from "@/modules/roster/server/procedures/get-many/types";

import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface RosterTableBodyProps {
  roster: RosterGetMany["users"];
}

export default function RosterTableBody({ roster }: RosterTableBodyProps) {
  const router = useRouter();
  const { data: currentSession } = authClient.useSession();

  return (
    <TableBody>
      {roster.length ? (
        roster.map((member, index) => {
          const isAdmin = member.role === "admin" || member.role === "staff";

          return (
            <TableRow
              key={member.id}
              className={cn(
                "hover:bg-primary/40 border-border cursor-pointer border-b transition-colors duration-150",
                index % 2 === 0 ? "bg-muted" : "bg-background",
              )}
              onClick={() =>
                currentSession?.user.id === member.id
                  ? router.push(`/profile`)
                  : router.push(`/profile/${member.id}`)
              }
            >
              <TableCell className="border-border border-r p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="border-border h-8 w-8 border">
                    <AvatarFallback className="text-secondary/70 bg-border text-xs font-semibold">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex items-center gap-2">
                    <div>
                      <p className="text-secondary/70 font-medium">
                        {member.name}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {member.email}
                      </p>
                    </div>

                    <Activity mode={isAdmin ? "visible" : "hidden"}>
                      <Crown className="text-secondary h-4 w-4" />
                    </Activity>
                  </div>
                </div>
              </TableCell>

              <TableCell className="border-border border-r p-4 text-center">
                {member?.team || "Not provided"}
              </TableCell>

              <TableCell className="border-border border-r p-4 text-center">
                {member?.discord || "Not provided"}
              </TableCell>

              <TableCell className="border-border border-r p-4 text-center">
                <StatusBadge
                  isActive={member.isActive}
                  banned={member.banned}
                />
              </TableCell>

              <TableCell className="p-4 text-center">
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
        })
      ) : (
        <TableRow>
          <TableCell
            colSpan={3}
            className="text-muted-foreground/70 h-24 text-center font-medium"
          >
            No members found.
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  );
}

function StatusBadge({
  isActive,
  banned,
}: {
  isActive: boolean;
  banned?: boolean | null;
}) {
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
          : "text-primary border border-red-400/20 bg-red-500/10",
      )}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
