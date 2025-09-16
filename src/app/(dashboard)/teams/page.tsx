import { redirect } from "next/navigation";

import { getSession } from "@/lib/get-session";

import { UnderConstruction } from "@/components/under-construction";
import { getCurrentSeasonInfo } from "@/app/api/cronjobs/utilities";

const TeamsPage = async () => {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  const seasonInfo = getCurrentSeasonInfo();
  console.log(seasonInfo)
  return (
    <UnderConstruction
      title="Teams"
      message="Team management features are coming soon. Stay tuned for collaboration tools!"
    />
  );
};

export default TeamsPage;
