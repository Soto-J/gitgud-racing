"use client";

import { Activity } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

import { IoHomeOutline } from "react-icons/io5";
import { IoPersonOutline } from "react-icons/io5";
import { IoPeopleOutline } from "react-icons/io5";
import { SlCalender } from "react-icons/sl";
import { BarChart3, ChevronRight, Crown, Flag } from "lucide-react";

import { Session } from "@/lib/auth";

import SidebarUserButton from "@/components/ui/sidebar/sidebar-user-button";
import { QuickStatsCard } from "@/components/ui/sidebar/quick-stats-card";
import { useFilterNavigationItems } from "@/hooks/use-filter-navigation-items";

import { Separator } from "@/components/ui/separator";
import { DashboardMenu } from "@/components/ui/sidebar/dashboard-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { UserRole } from "@/db/schemas/type";
import { USER_ROLES } from "@/db/schemas";

const firstSection = [
  {
    icon: IoHomeOutline,
    label: "Home",
    href: "/",
    roles: ["guest", "user", "staff", "admin"],
  },
  {
    icon: BarChart3,
    label: "Series Stats",
    href: "/series-stats",
    roles: ["guest", "user", "staff", "admin"],
  },
  {
    icon: SlCalender,
    label: "Schedule",
    href: "/schedule",
    roles: ["user", "staff", "admin"],
  },
];

const secondSection = [
  {
    icon: IoPersonOutline,
    label: "My Profile",
    href: "/profile",
    roles: ["user", "staff", "admin"],
  },
  {
    icon: IoPeopleOutline,
    label: "Roster",
    href: "/roster",
    roles: ["user", "staff", "admin"],
  },
  {
    icon: Flag,
    label: "Teams",
    href: "/teams",
    roles: ["user", "staff", "admin"],
  },
  {
    icon: Crown,
    label: "Manage",
    href: "/manage",
    roles: ["staff", "admin"],
  },
];

interface AppSidebarProps {
  session: Session | null;
}

export default function AppSidebar({ session }: AppSidebarProps) {
  const pathname = usePathname();

  const role: UserRole = USER_ROLES.includes(session?.user?.role as UserRole)
    ? (session?.user.role as UserRole)
    : "guest";

  const racingHub = firstSection.filter((navs) => navs.roles.includes(role));
  const driverZone = secondSection.filter((navs) => navs.roles.includes(role));

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/" className="flex items-center justify-center">
          <Image src="/gitgud-logo.png" alt="Git Gud" height={90} width={90} />
        </Link>
      </SidebarHeader>

      <Separator className="via-secondary/60 my-4 h-px bg-gradient-to-r from-transparent to-transparent" />

      <SidebarContent className="p-4">
        <SidebarGroup>
          <div className="mb-3">
            <h3 className="text-primary px-2 text-xs font-semibold tracking-wider uppercase">
              Racing Hub
            </h3>
          </div>

          <SidebarGroupContent>
            <SidebarMenu>
              {racingHub.map(({ href, label, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton asChild isActive={pathname === href}>
                    <Link
                      href={href}
                      className={cn(
                        "text-muted flex items-center gap-3 rounded-xl px-4 py-3 transition-colors duration-200",
                      )}
                    >
                      <Icon size={20} />
                      <span className="font-medium tracking-tight">
                        {label}
                      </span>
                      {pathname === href && (
                        <ChevronRight
                          className="text-primary ml-auto"
                          size={16}
                        />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Activity mode={role === "guest" ? "hidden" : "visible"}>
          <Separator className="via-secondary/60 my-4 h-px bg-gradient-to-r from-transparent to-transparent" />

          <SidebarGroup>
            <div className="mb-3">
              <h3 className="text-secondary px-2 text-xs font-semibold tracking-wider uppercase">
                Driver Zone
              </h3>
            </div>

            <SidebarGroupContent>
              <SidebarMenu>
                {driverZone.map(({ href, label, icon: Icon }) => {
                  // if (manageTab && currentUserIsAdmin === false) {
                  //   return null;
                  // }

                  return (
                    <SidebarMenuItem key={href}>
                      <SidebarMenuButton asChild isActive={pathname === href}>
                        <Link
                          href={href}
                          className={cn(
                            "relative flex items-center gap-3 rounded-xl px-4 py-3 transition-colors duration-200",
                            pathname === href
                              ? "text-secondary"
                              : "text-muted hover:text-primary",
                          )}
                        >
                          <Icon size={20} />
                          <span className="font-medium tracking-tight">
                            {label}
                          </span>
                          {pathname === href && (
                            <ChevronRight
                              className="text-primary ml-auto"
                              size={16}
                            />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </Activity>

        {/* <QuickStatsCard summaryData={data} /> */}
      </SidebarContent>

      <SidebarFooter className="text-muted">
        <SidebarUserButton />
      </SidebarFooter>
    </Sidebar>
  );
}
