import { cn } from "@/lib/utils";

import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function RosterTableHeader() {
  const headerLabels = ["Member", "Team", "Discord", "Status", "Role"];

  return (
    <TableHeader className="h-14">
      <TableRow className="border-muted-foreground">
        {headerLabels.map((label, i) => (
          <TableHead
            key={label}
            className={cn(
              "text-secondary font-semibold",
              i === 0 ? "pl-6" : "text-center",
            )}
          >
            {label}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
}
