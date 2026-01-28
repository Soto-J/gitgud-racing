import { User, UserCheck, UserX } from "lucide-react";

import type { RosterGetMany } from "@/modules/roster/server/procedures/get-many/types";

import { TableCaption } from "@/components/ui/table";

interface RosterTableFooterProps {
  total: RosterGetMany["total"];
  totalActive: RosterGetMany["totalActive"];
}

export default function RosterTableFooter({
  total,
  totalActive,
}: RosterTableFooterProps) {
  return (
    <>
      <TableCaption className="">
        <div className="flex items-center gap-x-6 px-4 pb-4">
          <div className="flex items-center gap-x-2">
            <User size={14} /> {total}
          </div>
          <div className="flex items-center gap-x-2">
            <UserCheck size={14} className="text-green-600" /> {totalActive}
          </div>
          <div className="flex items-center gap-x-2">
            <UserX size={14} className="text-destructive" />{" "}
            {total - totalActive}
          </div>

          <h4 className="text-muted-foreground/70 mx-auto pr-8">
            Complete roster of GitGud Racing community members.
          </h4>
        </div>
      </TableCaption>
    </>
  );
}
