import { Session } from "..";

export const getRoutePermission = (session: Session | null) => {
  const role = session?.user?.role ?? "guest";
};
