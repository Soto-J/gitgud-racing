import { redirect } from "next/navigation";

import { getSession } from "@/lib/get-session";

import { UnderConstruction } from "@/components/under-construction";

const TeamsPage = async () => {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  return (
    <UnderConstruction
      title="Teams"
      message="Team management features are coming soon. Stay tuned for collaboration tools!"
    />
  );
};

export default TeamsPage;
