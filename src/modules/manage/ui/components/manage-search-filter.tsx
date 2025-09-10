"use client";

import { SearchIcon } from "lucide-react";

import { useManageFilters } from "@/modules/manage/hooks/use-manage-filter";
import { useDebounceSearch } from "@/hooks/use-debounce-search";

import { Input } from "@/components/ui/input";

export const MembersSearchFilter = () => {
  const [filters, setFilters] = useManageFilters();
  const { searchValue, setSearchValue } = useDebounceSearch(
    filters,
    setFilters,
  );

  return (
    <div className="relative">
      <Input
        placeholder="Filter by name"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className="h-9 w-[200px] bg-white pl-7"
      />

      <SearchIcon className="text-muted-foreground absolute top-1/2 left-2 size-4 -translate-y-1/2" />
    </div>
  );
};
