import { SidebarToggle } from "@/modules/dashboard/ui/components/sidebar-toggle";
import { DashboardSidebar } from "@/modules/dashboard/ui/components/dashboard-sidebar";

import { SidebarProvider } from "@/components/ui/sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <DashboardSidebar />

      <main className="bg-muted flex w-screen flex-col">
        <SidebarToggle />
        {children}
      </main>
    </SidebarProvider>
  );
}
