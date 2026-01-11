"use client";

import { Crown, XCircleIcon } from "lucide-react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

import { DEFAULT_PAGE } from "@/modules/manage/constants";

import { MembersSearchFilter } from "@/modules/manage/ui/components/manage-search-filter";

import { useManageFilters } from "@/modules/manage/hooks/use-manage-filter";

import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Banner } from "@/components/banner";

export default function ManageListHeader() {
  const [filters, setFilters] = useManageFilters();

  const isFilterActive = !!filters.search;

  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.members.getMany.queryOptions({ ...filters }),
  );

  const onClearFilters = () =>
    setFilters({
      search: "",
      page: DEFAULT_PAGE,
    });

  return (
    <div className="space-y-4">
      <Banner
        section="Manage Racing League Members"
        title="Git Gud Fam"
        subTitle1={`${data.total} Members`}
        subTitle2={`${data.totalActive} Active`}
        icon={Crown}
      />

      <ScrollArea>
        <div className="flex items-center gap-x-2 py-6 pl-1">
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
}
