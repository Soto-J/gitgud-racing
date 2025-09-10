"use client";

import { SearchIcon } from "lucide-react";

import { useChartFilter } from "@/modules/iracing/hooks/use-chart-data-filter";
import { useDebounceSearch } from "@/hooks/use-debounce-search";

import { Input } from "@/components/ui/input";

export const ChartSearchFilter = () => {
  const [filters, setFilters] = useChartFilter();
  const { searchValue, setSearchValue } = useDebounceSearch(
    filters,
    setFilters,
  );

  return (
    <div className="relative">
      <Input
        placeholder="Search series or tracks..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className="h-10 w-64 rounded-xl border-gray-300 bg-white pr-4 pl-10 text-sm shadow-sm transition-all placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
      />

      <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
    </div>
  );
};
