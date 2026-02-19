"use client";

import { useState } from "react";

import { ArrowDownAZ, ArrowUpAZ } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import SearchInput from "@/components/search-input";
import ScheduleGrid from "@/modules/iracing-schedule/ui/components/schedule-grid";
import CategoryFilter from "@/modules/iracing-schedule/ui/components/category-filter";
import LicenseFilter from "@/modules/iracing-schedule/ui/components/license-filter";

export default function IracingScheduleView() {
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedLicenses, setSelectedLicenses] = useState<number[]>([]);
  const [sortAsc, setSortAsc] = useState(true);

  const trpc = useTRPC();
  const { data: seasons } = useSuspenseQuery(
    trpc.iracingSchedule.getMany.queryOptions(),
  );

  const filtered = seasons
    .filter((s) =>
      search
        ? s.season_name.toLowerCase().includes(search.toLowerCase())
        : true,
    )
    .filter((s) =>
      selectedCategories.length > 0
        ? selectedCategories.includes(s.current_week_sched.category_id)
        : true,
    )
    .filter((s) =>
      selectedLicenses.length > 0
        ? s.license_group_types.some(({ license_group_type }) =>
            selectedLicenses.includes(license_group_type),
          )
        : true,
    )
    .sort((a, b) => {
      const cmp = a.season_name.localeCompare(b.season_name, "en");
      return sortAsc ? cmp : -cmp;
    });

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="w-full overflow-x-auto lg:w-auto">
          <CategoryFilter
            value={selectedCategories}
            onChange={setSelectedCategories}
          />
        </div>

        <LicenseFilter
          value={selectedLicenses}
          onChange={setSelectedLicenses}
        />

        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search series..."
          className="min-w-48 flex-1"
        />

        <Button
          variant="outline"
          size="icon"
          onClick={() => setSortAsc((prev) => !prev)}
          aria-label={sortAsc ? "Sort descending" : "Sort ascending"}
        >
          {sortAsc ? (
            <ArrowDownAZ className="size-4" />
          ) : (
            <ArrowUpAZ className="size-4" />
          )}
        </Button>
      </div>

      <ScheduleGrid seasons={filtered} />
    </div>
  );
}
