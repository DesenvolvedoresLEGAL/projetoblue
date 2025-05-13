
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { ModularSidebar } from "./ModularSidebar";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { PageBreadcrumbs } from "./PageBreadcrumbs";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleMobileSidebar = () => {
    setMobileOpen((prev) => !prev);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className={`hidden md:flex transition-all duration-300 ${sidebarCollapsed ? 'w-16' : ''}`}>
        <ModularSidebar collapsed={sidebarCollapsed} />
      </div>

      {/* Mobile Sidebar - shown when mobileOpen is true */}
      <div 
        className={`fixed inset-0 z-50 md:hidden ${mobileOpen ? "block" : "hidden"}`}
      >
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50" 
          onClick={toggleMobileSidebar}
          aria-hidden="true"
        />
        
        {/* Sidebar */}
        <div className="fixed inset-y-0 left-0 w-full max-w-xs">
          <ModularSidebar isMobile={true} onClose={toggleMobileSidebar} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 w-full">
        <Header>
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden mr-2"
            onClick={toggleMobileSidebar}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-sidebar"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          
          {/* Desktop sidebar collapse button */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex mr-2"
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!sidebarCollapsed}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </Header>
        <main className="flex-1 overflow-y-auto pb-14" role="main" aria-label="Main content">
          <div className="container mx-auto py-6 px-4 max-w-7xl">
            <PageBreadcrumbs />
            <Outlet />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
