"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  RowData,
  useReactTable,
} from "@tanstack/react-table";

import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

declare module "@tanstack/react-table" {
  // Allows us to pass filters as props
  interface CellContext<TData extends RowData, TValue> {
    filters: {
      search: string;
      page: number;
      memberId: string;
    };
  }
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filters: {
    search: string;
    page: number;
    memberId: string;
  };
  onRowClick?: (row: TData) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filters,
  onRowClick,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-700 bg-black shadow-lg">
      <Table className="bg-black text-white">
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row, index) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                onClick={() => onRowClick?.(row.original)}
                className={`hover:bg-ferrari-dark-red border-b border-zinc-800 transition-colors duration-150 ${index % 2 === 0 ? "bg-zinc-900" : "bg-black"} `}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="border-r border-zinc-800 p-4 text-center text-sm font-medium text-yellow-100 last:border-r-0"
                  >
                    {flexRender(cell.column.columnDef.cell, {
                      ...cell.getContext(),
                      filters,
                    })}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center font-medium text-zinc-500"
              >
                No results found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
