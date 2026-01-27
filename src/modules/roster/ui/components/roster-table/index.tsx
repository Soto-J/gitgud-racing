import type { RosterGetMany } from "@/modules/roster/server/procedures/get-many/types";

import RosterTableHeader from "./roster-table-header";
import RosterTableBody from "./roster-table-body";
import RosterTableFooter from "./roster-table-footer";

import { Table } from "@/components/ui/table";

interface RosterTableProps {
  roster: RosterGetMany["users"];
}

export const RosterTable = ({ roster }: RosterTableProps) => {
  return (
    <div className="bg-background border-border overflow-hidden rounded-xl border">
      <Table>
        <RosterTableHeader />
        <RosterTableBody roster={roster} />
        <RosterTableFooter />
      </Table>
    </div>
  );
};

RosterTable.displayName = "RosterTable";
