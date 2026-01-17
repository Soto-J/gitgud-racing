import {
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function RosterTableHeader() {
  return (
    <>
      <TableCaption className="text-zinc-400">
        Complete roster of GitGud Racing community members.
      </TableCaption>

      <TableHeader>
        <TableRow className="border-b border-zinc-800 hover:bg-zinc-900/50">
          <TableHead className="pl-6 font-semibold text-yellow-100">
            Member
          </TableHead>
          <TableHead className="text-center font-semibold text-yellow-100">
            Status
          </TableHead>
          <TableHead className="text-center font-semibold text-yellow-100">
            Role
          </TableHead>
        </TableRow>
      </TableHeader>
    </>
  );
}
