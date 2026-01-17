"use client";

import { useRouter } from "next/navigation";

import { RosterGetMany } from "@/modules/roster/server/procedures/get-many/schema";

import RosterTableHeader from "./roster-table-header";
import RosterTableBody from "./roster-table-body";

import { Card, CardContent } from "@/components/ui/card";
import { Table } from "@/components/ui/table";

interface RosterTableProps {
  members: RosterGetMany["users"];
  loggedInUserId: string;
}

export const RosterTable = ({ members, loggedInUserId }: RosterTableProps) => {
  const router = useRouter();

  return (
    <Card className="border-0 bg-black">
      <CardContent className="px-0">
        <Table className="bg-black text-white">
          <RosterTableHeader />
          <RosterTableBody members={members} loggedInUserId={loggedInUserId} />
        </Table>
      </CardContent>
    </Card>
  );
};

RosterTable.displayName = "RosterTable";
