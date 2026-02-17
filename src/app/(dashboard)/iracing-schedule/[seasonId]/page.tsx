import type { SearchParams } from "nuqs";

import UnderConstruction from "@/components/under-construction";

interface SeasonIdPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function SeasonIdPage({
  searchParams,
}: SeasonIdPageProps) {
  if (process.env.NODE_ENV !== "development") {
    return <UnderConstruction title="iRacing Schedule" message="Stay tuned!" />;
  }

  return <div></div>;
}
