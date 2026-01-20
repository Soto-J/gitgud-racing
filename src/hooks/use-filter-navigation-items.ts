import type { ComponentType } from "react";

import { UserTable } from "@/db/schemas/type";

export type NavigationItem = {
  icon: ComponentType<{ className?: string }>;
  label: string;
  href: `/${string}`;
  roles: UserTable["role"][];
};

export const useFilterNavigationItems = (
  items: readonly NavigationItem[],
  userRole: UserTable["role"] | null,
) => {
  const role = userRole ?? "guest";

  return items.filter((item) => item.roles.includes(role));
};
