import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function RosterTableHeader() {
  const headerLabels = ["Team", "Discord", "Status", "Role"];

  return (
    <TableHeader className="h-14">
      <TableRow className="border-muted-foreground">
        <TableHead className="text-secondary pl-6 font-semibold">
          Member
        </TableHead>

        {headerLabels.map((label) => (
          <TableHead
            key={label}
            className="text-secondary text-center font-semibold"
          >
            {label}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
}
