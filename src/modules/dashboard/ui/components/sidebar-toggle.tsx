"use client";

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

export const SidebarToggle = () => {
  const { state } = useSidebar();

  return (
    <header className="from-background via-background/95 to-background/90 border-border/50 relative flex items-center gap-x-4 border-b bg-gradient-to-r px-4 py-3 shadow-sm shadow-black/5 backdrop-blur-md dark:shadow-white/5">
      {/* Subtle racing accent line */}
      <div className="via-sidebar-primary/30 absolute right-0 bottom-0 left-0 h-px bg-gradient-to-r from-transparent to-transparent" />

      <SidebarTrigger
        variant="outline"
        className="border-sidebar-border/70 hover:border-sidebar-primary/50 hover:bg-sidebar-accent/10 hover:shadow-sidebar-primary/10 focus-visible:border-sidebar-primary focus-visible:ring-sidebar-primary/20 size-9 transition-all duration-200 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
        aria-expanded={state === "expanded"}
        aria-controls="main-sidebar"
        aria-label={`${state === "collapsed" ? "Expand" : "Collapse"} sidebar navigation`}
      />
    </header>
  );
};
