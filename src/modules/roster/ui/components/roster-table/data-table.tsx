"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { cn } from "@/lib/utils";

import { User, UserCheck, UserX } from "lucide-react";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowClick?: (row: TData) => void;
  total: number;
  totalActive: number;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
  total,
  totalActive,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="bg-card border-border overflow-hidden rounded-xl border shadow-xl">
      <Table>
        <TableHeader className="h-14">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="border-muted-foreground">
              {headerGroup.headers.map((header, index) => (
                <TableHead
                  key={header.id}
                  className={cn(
                    "text-secondary font-semibold",
                    index === 0 ? "pl-6" : "text-center",
                  )}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row, index) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                onClick={() => onRowClick?.(row.original)}
                className={cn(
                  "hover:bg-primary/40 border-border cursor-pointer border-b transition-colors duration-150",
                  index % 2 === 0 ? "bg-background" : "bg-card",
                )}
              >
                {row.getVisibleCells().map((cell, cellIndex) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      "p-4",
                      cellIndex === 0 ? "" : "text-center",
                      cellIndex < row.getVisibleCells().length - 1
                        ? "border-border border-r"
                        : "",
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="text-muted-foreground/70 h-24 text-center font-medium"
              >
                No members found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>

        <TableCaption>
          <div className="flex items-center gap-x-6 px-4 pb-4">
            <div className="flex items-center gap-x-2">
              <User size={14} /> {total}
            </div>
            <div className="flex items-center gap-x-2">
              <UserCheck size={14} className="text-chart-2" /> {totalActive}
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
      </Table>
    </div>
  );
}
