import { SidebarToggle } from "@/modules/dashboard/ui/components/sidebar-toggle";
import { DashboardSidebar } from "@/modules/dashboard/ui/components/dashboard-sidebar";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <DashboardSidebar />

      <SidebarInset className="bg-muted">
        <SidebarToggle />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
