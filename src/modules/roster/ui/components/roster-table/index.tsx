import type { RosterGetMany } from "@/modules/roster/server/procedures/get-many/types";

import RosterTableHeader from "./roster-table-header";
import RosterTableBody from "./roster-table-body";

import { Card, CardContent } from "@/components/ui/card";
import { Table } from "@/components/ui/table";

interface RosterTableProps {
  roster: RosterGetMany["users"];
  loggedInUserId: string;
}

export const RosterTable = ({ roster, loggedInUserId }: RosterTableProps) => {
  return (
    <Card className="bg-background border-0">
      <CardContent className="px-0">
        <Table className="text-foreground bg-background">
          <RosterTableHeader />
          <RosterTableBody roster={roster} loggedInUserId={loggedInUserId} />
        </Table>
      </CardContent>
    </Card>
  );
};

RosterTable.displayName = "RosterTable";
