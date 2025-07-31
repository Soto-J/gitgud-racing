"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import { IoHomeOutline } from "react-icons/io5";
import { IoPersonOutline } from "react-icons/io5";
import { IoPeopleOutline } from "react-icons/io5";

import { ChevronRight, Crown, Flag, StarIcon } from "lucide-react";

import { DashboardUserButton } from "@/modules/dashboard/ui/components/dashboard-user-button";

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
  { icon: IoPersonOutline, label: "My Profile", href: "/profile" },
  { icon: IoPeopleOutline, label: "Members", href: "/members" },
  { icon: Flag, label: "Teams", href: "/teams" },
];

const secondSection = [
  { icon: Crown, label: "Admin", href: "/admin", isAdmin: false },
  { icon: StarIcon, label: "Mock", href: "/#" },
];

export const DashboardSidebar = () => {
  const pathname = usePathname();

  return (
    <Sidebar className="border-red-800/30 shadow-2xl">
      <SidebarHeader className="relative">
        <Link href="/" className="h-36">
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
              {secondSection.map(({ href, label, icon: Icon }) => (
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
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Stats Card */}
        <div className="backdrop-blur-s mt-6 rounded-xl border border-red-700/30 bg-gradient-to-br from-red-900/30 to-red-800/30 p-4">
          <h4 className="mb-3 text-sm font-semibold text-red-200">
            Quick Stats
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-gray-300">
              <span>iRating</span>
              <span className="font-semibold text-red-300">2,847</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Safety</span>
              <span className="font-semibold text-green-400">A 4.23</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Races</span>
              <span className="font-semibold text-blue-300">142</span>
            </div>
          </div>
        </div>
      </SidebarContent>

      <SidebarFooter className="text-white">
        <DashboardUserButton />
      </SidebarFooter>
    </Sidebar>
  );
};
