"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const buttonClassName =
  "bg-chart-4 border-border text-muted inline-flex items-center gap-1 rounded-xl border px-4 py-2.5 text-xs font-medium shadow-sm transition-all hover:border-primary/50 hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50";

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
        className={buttonClassName}
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>

      <div className="flex items-center gap-2">
        <span className="text-foreground text-sm">Page</span>
        <div className="bg-chart-4 text-primary-foreground inline-flex items-center justify-center rounded-lg px-3 py-1 text-sm font-semibold">
          {page}
        </div>
        <span className="text-foreground text-sm">of {totalPages}</span>
      </div>

      <Button
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        className={buttonClassName}
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
