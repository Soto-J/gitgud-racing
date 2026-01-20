import SidebarToggle from "@/components/ui/sidebar/sidebar-toggle";
import AppSidebar from "@/components/ui/sidebar/app-sidebar";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getCurrentSession } from "@/lib/auth/utils/get-current-session";

import { getRoutePermission } from "@/lib/auth/utils/get-route-permission";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const session = await getCurrentSession();

  return (
    <SidebarProvider>
      <AppSidebar session={session} />

      <SidebarInset className="bg-muted">
        <SidebarToggle />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
