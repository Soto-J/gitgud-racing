import { SearchIcon } from "lucide-react";

import { useChartDataFilters } from "@/modules/home/hooks/use-chart-data-filter";

import { Input } from "@/components/ui/input";

export const ChartSearchFilter = () => {
  const [filters, setFilters] = useChartDataFilters();

  return (
    <div className="relative">
      <Input
        placeholder="Filter by name"
        value={filters.search}
        onChange={(e) => setFilters({ search: e.target.value })}
        className="h-9 w-[200px] bg-white pl-7"
      />

      <SearchIcon className="text-muted-foreground absolute top-1/2 left-2 size-4 -translate-y-1/2" />
    </div>
  );
};
