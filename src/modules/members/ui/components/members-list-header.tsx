"use client";

import { IoPeopleOutline } from "react-icons/io5";
import { XCircleIcon } from "lucide-react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

import { DEFAULT_PAGE } from "@/modules/members/server/procedures/get-many/params";

import { useMembersFilters } from "@/modules/members/hooks/use-members-filter";

import { MembersSearchFilter } from "@/modules/members/ui/components/members-search-filter";

import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

import Banner from "@/components/banner";

export default function MembersListHeader() {
  const [filters, setFilters] = useMembersFilters();

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
        section="Racing League Members"
        title="Git Gud Fam"
        subTitle1={`${data.total} Members`}
        subTitle2={`${data.totalActive} Active`}
        icon={IoPeopleOutline}
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
