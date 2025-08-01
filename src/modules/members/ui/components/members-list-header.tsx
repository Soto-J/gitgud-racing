"use client";

import { XCircleIcon } from "lucide-react";

import { DEFAULT_PAGE } from "@/constants";

import { useMembersFilters } from "@/modules/members/hooks/use-members-filter";

import { MembersSearchFilter } from "@/modules/members/ui/components/members-search-filter";

import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export const MembersListHeader = () => {
  const [filters, setFilters] = useMembersFilters();

  const isFilterActive = !!filters.search;

  const onClearFilters = () =>
    setFilters({
      search: "",
      page: DEFAULT_PAGE,
    });

  return (
    <div className="space-y-4 p-4 md:p-8">
      <div className="py-8 text-center">
        <h1 className="text-ferrari-dark-red mb-2 text-3xl font-bold">
          Git Gud Fam
        </h1>

        <p className="text-lg text-gray-600">Racing League Members</p>
      </div>

      <ScrollArea>
        <h5 className="p-2 text-xl font-medium">Members</h5>
        <div className="flex items-center gap-x-2 p-1">
          <MembersSearchFilter />

          {isFilterActive && (
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              <XCircleIcon />
              <span>Clear</span>
            </Button>
          )}
        </div>

        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};
