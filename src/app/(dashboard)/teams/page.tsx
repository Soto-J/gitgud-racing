import UnderConstruction from "@/components/under-construction";

import { HydrateClient } from "@/components/hydration-client";

export default async function TeamsPage() {
  return (
    <HydrateClient>
      <UnderConstruction
        title="Teams"
        message="Team management features are coming soon. Stay tuned for collaboration tools!"
      />
    </HydrateClient>
  );
}
