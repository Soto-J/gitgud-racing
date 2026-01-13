import SidebarToggle from "@/modules/dashboard/ui/components/sidebar-toggle";
import AppSidebar from "@/modules/dashboard/ui/components/app-sidebar";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset className="bg-muted">
        <SidebarToggle />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
