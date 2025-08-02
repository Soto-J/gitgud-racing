"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import { IoHomeOutline } from "react-icons/io5";
import { IoPersonOutline } from "react-icons/io5";
import { IoPeopleOutline } from "react-icons/io5";
import { SlCalender } from "react-icons/sl";

import { ChevronRight, Crown, Flag } from "lucide-react";

import { authClient } from "@/lib/auth-client";

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
  { icon: SlCalender, label: "Schedule", href: "/schedule" },
];

const secondSection = [
  { icon: IoPersonOutline, label: "My Profile", href: "/profile" },
  { icon: IoPeopleOutline, label: "Members", href: "/members" },
  { icon: Flag, label: "Teams", href: "/teams" },
  { icon: Crown, label: "Admin", href: "/admin", adminTab: true },
];

export const DashboardSidebar = () => {
  const pathname = usePathname();

  const { data: session } = authClient.useSession();
  const currentUserIsAdmin = session?.user?.role === "admin";

  return (
    <Sidebar className="border-red-800/30 shadow-2xl">
      <SidebarHeader className="relative">
        <Link href="/" className="h-24 md:h-30">
          <Image
            src="/gitgud-logo.png"
            alt="Git Gud"
            fill
            className="object-contain"
          />
        </Link>
      </SidebarHeader>

      <Separator className="my-4 h-px bg-gradient-to-r from-transparent via-red-600/50 to-transparent" />

      <SidebarContent className="p-4">
        <SidebarGroup>
          <div className="mb-3">
            <h3 className="px-2 text-xs font-semibold tracking-wider text-red-300 uppercase">
              Racing Hub
            </h3>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {firstSection.map(({ href, label, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === href}
                    className={cn(
                      "relative overflow-hidden transition-all duration-300",
                      pathname === href &&
                        "bg-gradient-to-r from-red-600/90 to-red-700/90 shadow-lg shadow-red-500/25",
                    )}
                  >
                    <Link
                      href={href}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-4 py-3 transition-colors duration-200",
                        pathname === href
                          ? "text-white"
                          : "text-gray-300 hover:[&>*]:text-black",
                      )}
                    >
                      <Icon size={20} className="" />
                      <span className="font-medium tracking-tight">
                        {label}
                      </span>
                      {pathname === href && (
                        <ChevronRight
                          className="ml-auto text-red-200"
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

        <Separator className="my-4 h-px bg-gradient-to-r from-transparent via-red-600/50 to-transparent" />

        <SidebarGroup>
          <div className="mb-3">
            <h3 className="px-2 text-xs font-semibold tracking-wider text-red-300 uppercase">
              Driver Zone
            </h3>
          </div>

          <SidebarGroupContent>
            <SidebarMenu>
              {secondSection.map(({ href, label, icon: Icon, adminTab }) => {
                if (adminTab && currentUserIsAdmin === false) {
                  return null;
                }

                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === href}
                      className={cn(
                        "relative overflow-hidden transition-all duration-300",
                        pathname === href &&
                          "bg-gradient-to-r from-red-600/90 to-red-700/90 shadow-lg shadow-red-500/25",
                      )}
                    >
                      <Link
                        href={href}
                        className={cn(
                          "relative flex items-center gap-3 rounded-xl px-4 py-3 transition-colors duration-200",
                          pathname === href
                            ? "text-black"
                            : "text-white hover:[&>*]:text-black",
                        )}
                      >
                        <Icon size={20} />
                        <span className="font-medium tracking-tight">
                          {label}
                        </span>
                        {pathname === href && (
                          <ChevronRight
                            className="ml-auto text-red-200"
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

        <QuickStatsCard />
      </SidebarContent>

      <SidebarFooter className="text-white">
        <DashboardUserButton />
      </SidebarFooter>
    </Sidebar>
  );
};
