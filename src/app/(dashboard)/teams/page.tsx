import { redirect } from "next/navigation";

import { getSession } from "@/lib/get-session";

import { UnderConstruction } from "@/components/under-construction";
import { getCurrentSeasonInfo } from "@/app/api/cronjobs/utilities";
import { DateTime } from "luxon";

const TeamsPage = async () => {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  // const seasonInfo = getCurrentSeasonInfo();
  // console.log(seasonInfo);
  // let reset = DateTime.now().startOf("week").plus({ hours: 20 });
  // console.log({ reset });
  // console.log(reset.day);

  // const test = DateTime.now().set({ weekday: 1 });
  // console.log({ test });
  return (
    <UnderConstruction
      title="Teams"
      message="Team management features are coming soon. Stay tuned for collaboration tools!"
    />
  );
};

export default TeamsPage;
