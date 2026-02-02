"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ChartPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function ChartPagination({
  page,
  totalPages,
  onPageChange,
}: ChartPaginationProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      <Button
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(Math.max(1, page - 1))}
        className="bg-foreground border-border inline-flex items-center gap-1 rounded-xl border px-4 py-2.5 text-xs font-medium text-gray-700 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Page</span>
        <div className="inline-flex items-center justify-center rounded-lg bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
          {page}
        </div>
        <span className="text-sm text-gray-600">of {totalPages}</span>
      </div>

      <Button
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        className="bg-foreground border-border inline-flex items-center gap-1 rounded-xl border px-4 py-2.5 text-xs font-medium text-gray-700 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
