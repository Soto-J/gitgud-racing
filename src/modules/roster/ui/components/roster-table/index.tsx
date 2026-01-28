import type { RosterGetMany } from "@/modules/roster/server/procedures/get-many/types";

import RosterTableHeader from "./roster-table-header";
import RosterTableBody from "./roster-table-body";
import RosterTableFooter from "./roster-table-footer";

import { Table } from "@/components/ui/table";

interface RosterTableProps {
  roster: RosterGetMany;
}

export default function RosterTable({ roster }: RosterTableProps) {
  return (
    <div className="bg-card border-border overflow-hidden rounded-xl border shadow-xl">
      <Table>
        <RosterTableHeader />
        <RosterTableBody roster={roster.users} />
        <RosterTableFooter
          total={roster.total}
          totalActive={roster.totalActive}
        />
      </Table>
    </div>
  );
}

RosterTable.displayName = "RosterTable";
