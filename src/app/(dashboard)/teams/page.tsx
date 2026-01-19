import { redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/auth/get-current-session";

// import { getCurrentSeasonInfo } from "@/app/api/cronjobs/utilities";
import UnderConstruction from "@/components/under-construction";
import { DateTime } from "luxon";
import { HydrateClient } from "@/components/hydration-client";

export default async function TeamsPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/sign-in");

  // const seasonInfo = getCurrentSeasonInfo();
  // console.log(seasonInfo);
  // let reset = DateTime.now().startOf("week").plus({ hours: 20 });
  // console.log({ reset });
  // console.log(reset.day);

  // const test = DateTime.now().set({ weekday: 1 });
  // console.log({ test });
  return (
    <HydrateClient>
      <UnderConstruction
        title="Teams"
        message="Team management features are coming soon. Stay tuned for collaboration tools!"
      />
    </HydrateClient>
  );
}
