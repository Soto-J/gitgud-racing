"use client";

import { Activity } from "react";

import { IoPeopleOutline } from "react-icons/io5";
import { XCircleIcon } from "lucide-react";

import { DEFAULT_PAGE } from "@/modules/roster/server/procedures/get-many/types/params";

import { useRosterFilters } from "@/modules/roster/hooks/use-roster-filter";
import { useDebounceSearch } from "@/hooks/use-debounce-search";

import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Banner from "@/components/banner";
import SearchInput from "@/components/search-input";

export default function RosterHeader() {
  const [filters, setFilters] = useRosterFilters();
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
    <div className="space-y-4">
      <Banner
        section="Racing League Members"
        title="Git Gud Fam"
        subTitle1={` Members`}
        subTitle2={` Active`}
        icon={IoPeopleOutline}
      />

      <ScrollArea>
        <div className="flex items-center gap-x-2 py-6 pl-1">
          <SearchInput
            placeholder="Filter by name"
            value={searchValue}
            onChange={setSearchValue}
            className="bg-foreground h-9 w-[200px]"
          />

          <Activity mode={isFilterActive ? "visible" : "hidden"}>
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              <XCircleIcon />
              <span>Clear</span>
            </Button>
          </Activity>
        </div>

        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
