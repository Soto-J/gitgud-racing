import { UserRole } from "@/db/schemas/type";
import { auth, Session } from "@/lib/auth";
import { roles, RouteRole } from "@/lib/auth/permissions";

export const useRoutePermission = async (session: Session | null) => {
  const role = session?.user?.role ?? "guest";


  const enableRoutes = [];
};
