import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";

import { ProfileView } from "@/modules/profile/ui/views/profile-view";
import { getQueryClient, trpc } from "@/trpc/server";

const ProfilePage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/sign-in");

  
  return <ProfileView />;
};

export default ProfilePage;
