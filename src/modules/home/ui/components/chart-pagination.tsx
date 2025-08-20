"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface ChartPaginationProps {
  length?: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const ChartPagination = ({
  length,
  page,
  totalPages,
  onPageChange,
}: ChartPaginationProps) => {
  return (
    <div className="mb-4 flex items-center justify-between">
      <button
        className="bg-secondary hover:bg-secondary/80 flex items-center gap-2 rounded-md px-3 py-2 text-sm"
        onClick={() => onPageChange(Math.max(1, page - 1))}
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </button>

      <span className="text-muted-foreground text-sm">
        Showing 1-12 of {length || 0} months
      </span>
      
      <button
        className="bg-secondary hover:bg-secondary/80 flex items-center gap-2 rounded-md px-3 py-2 text-sm"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};
