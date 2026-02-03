"use client";

import { Activity } from "react";

import { XCircleIcon } from "lucide-react";

import { useDebounceSearch } from "@/hooks/use-debounce-search";
import { useChartFilter } from "@/modules/series-results/hooks/use-chart-data-filter";
import { DEFAULT_PAGE } from "@/modules/series-results/server/procedures/search-series-results/types/schema";

import ChartPagination from "./chart-pagination";

import { Button } from "@/components/ui/button";
import SearchInput from "@/components/search-input";

interface ChartToolbarProps {
  totalPages: number;
}

export default function ChartToolbar({ totalPages }: ChartToolbarProps) {
  const [filters, setFilters] = useChartFilter();
  const { searchValue, setSearchValue } = useDebounceSearch(
    filters,
    setFilters,
  );

  const isFilterActive = !!filters.search;

  const onClearFilters = () =>
    setFilters({
      search: "",
      page: DEFAULT_PAGE,
    });

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center justify-center gap-3">
        <SearchInput
          placeholder="Search series or tracks..."
          value={searchValue}
          onChange={setSearchValue}
          className="border-muted-foreground placeholder:text-muted-foreground h-10 w-64 rounded-xl text-sm shadow-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />

        <Activity mode={isFilterActive ? "visible" : "hidden"}>
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="text-primary/70 border-border hover:primary hover:bg-primary"
          >
            <XCircleIcon className="h-4 w-4" />
            <span>Clear</span>
          </Button>
        </Activity>
      </div>

      <ChartPagination
        page={filters.page}
        totalPages={totalPages}
        onPageChange={(page) => setFilters({ page })}
      />
    </div>
  );
}
