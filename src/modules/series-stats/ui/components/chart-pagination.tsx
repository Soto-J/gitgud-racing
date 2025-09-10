"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface ChartPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const ChartPagination = ({
  page,
  totalPages,
  onPageChange,
}: ChartPaginationProps) => {
  return (
    <div className="flex items-center justify-center gap-4">
      <button
        className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </button>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Page</span>
        <div className="inline-flex items-center justify-center rounded-lg bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
          {page}
        </div>
        <span className="text-sm text-gray-600">of {totalPages}</span>
      </div>

      <button
        className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};
