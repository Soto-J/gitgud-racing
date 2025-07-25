"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { IoPersonOutline } from "react-icons/io5";
import { BotIcon, StarIcon, VideoIcon } from "lucide-react";

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
  { icon: IoPersonOutline, label: "Members", href: "/members" },
  { icon: BotIcon, label: "Profile", href: "/profile" },
];

const secondSection = [{ icon: StarIcon, label: "Upgrade", href: "/upgrade" }];

export const DashboardSidebar = () => {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="text-sidebar-accent-foreground flex items-center justify-center">
        <Link href="/" className="">
          <Image
            src="/gitgud-logo.png"
            alt="Git Gud"
            height={70}
            width={70}
            className="object-cover"
          />
        </Link>
      </SidebarHeader>

      <div className="px-4 py-2">
        <Separator className="bg-black opacity-10" />
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {firstSection.map(({ href, label, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === href}
                    className={cn(
                      "from-sidebar-accent to-sidebar/50 via-sidebar/50 h-10 border border-transparent from-5% via-30% text-white hover:border-[#FFF200]/10 hover:bg-linear-to-r/oklch",
                      pathname === href &&
                        "border-[#FFF200]/10 bg-linear-to-r/oklch text-black",
                    )}
                  >
                    <Link href={href} className="flex items-center gap-2">
                      <Icon className="" />
                      <span className="text-sm font-medium tracking-tight">
                        {label}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="px-4 py-2">
          <Separator className="bg-black opacity-10" />
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondSection.map(({ href, label, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === href}
                    className={cn(
                      "from-sidebar-accent to-sidebar/50 via-sidebar/50 h-10 border border-transparent from-5% via-30% hover:border-[#FFF200]/10 hover:bg-linear-to-r/oklch",
                      pathname === href &&
                        "border-[#FFF200]/10 bg-linear-to-r/oklch",
                    )}
                  >
                    <Link href={href}>
                      <Icon className="size-5" />
                      <span className="text-sm font-medium tracking-tight">
                        {label}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="text-white">
        <DashboardUserButton />
      </SidebarFooter>
    </Sidebar>
  );
};
