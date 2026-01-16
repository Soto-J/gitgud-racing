"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

import { IoHomeOutline } from "react-icons/io5";
import { IoPersonOutline } from "react-icons/io5";
import { IoPeopleOutline } from "react-icons/io5";
import { SlCalender } from "react-icons/sl";

import { BarChart3, ChevronRight, Crown, Flag } from "lucide-react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

import { authClient } from "@/lib/auth/auth-client";

import { DashboardUserButton } from "@/modules/dashboard/ui/components/dashboard-user-button";
import { QuickStatsCard } from "@/modules/dashboard/ui/components/quick-stats-card";

import { Separator } from "@/components/ui/separator";
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

const firstSection = [
  { icon: IoHomeOutline, label: "Home", href: "/" },
  { icon: BarChart3, label: "Series Stats", href: "/series-stats" },
  { icon: SlCalender, label: "Schedule", href: "/schedule" },
];

const secondSection = [
  { icon: IoPersonOutline, label: "My Profile", href: "/profile" },
  { icon: IoPeopleOutline, label: "Roster", href: "/roster" },
  { icon: Flag, label: "Teams", href: "/teams" },
  { icon: Crown, label: "Manage", href: "/manage", manageTab: true },
];

export const DashboardMenu = () => {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const currentUserIsAdmin =
    session?.user.role === "admin" || session?.user.role === "staff";
  const pathname = usePathname();

  const trpc = useTRPC();
  const { error, data } = useSuspenseQuery(
    trpc.iracing.getUserSummary.queryOptions(),
  );

  if (error) {
    router.push("/sign-in");
  }

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
              {firstSection.map(({ href, label, icon: Icon }) => (
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

        <Separator className="via-secondary/60 my-4 h-px bg-gradient-to-r from-transparent to-transparent" />

        <SidebarGroup>
          <div className="mb-3">
            <h3 className="text-secondary px-2 text-xs font-semibold tracking-wider uppercase">
              Driver Zone
            </h3>
          </div>

          <SidebarGroupContent>
            <SidebarMenu>
              {secondSection.map(({ href, label, icon: Icon, manageTab }) => {
                if (manageTab && currentUserIsAdmin === false) {
                  return null;
                }

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

        <QuickStatsCard summaryData={data} />
      </SidebarContent>

      <SidebarFooter className="text-muted">
        <DashboardUserButton />
      </SidebarFooter>
    </Sidebar>
  );
};
