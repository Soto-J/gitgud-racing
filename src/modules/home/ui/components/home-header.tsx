"use client";

import { XCircleIcon } from "lucide-react";

import { useChartFilter } from "@/modules/home/hooks/use-chart-data-filter";
import { DEFAULT_PAGE } from "@/modules/home/constants";

import { ChartSearchFilter } from "./chart-search-filter";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChartPagination } from "./chart-pagination";

export const HomeHeader = () => {
  const [filters, setFilters] = useChartFilter();

  const isFilterActive = !!filters.search;

  const onClearFilters = () =>
    setFilters({
      search: "",
      page: DEFAULT_PAGE,
    });

  return (
    <>
      <div className="mb-6 py-8 text-center">
        <h2 className="text-foreground mb-2 text-2xl font-bold">
          Series Statistics Overview
        </h2>
        <p className="text-muted-foreground">
          Average entrants and splits per week
        </p>
      </div>

      <ScrollArea>
        <div className="flex items-center gap-x-2 p-1">
          <ChartSearchFilter />

          {isFilterActive && (
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              <XCircleIcon />
              <span>Clear</span>
            </Button>
          )}
        </div>

        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </>
  );
};
