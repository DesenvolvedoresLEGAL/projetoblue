
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { ModularSidebar } from "./ModularSidebar";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Toaster } from "sonner";

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
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Toaster position="top-right" richColors />
      
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <ModularSidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
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
        <Header onToggleSidebar={toggleMobileSidebar} />
        <main className="flex-1 overflow-y-auto p-4" role="main" aria-label="Main content">
          <div className="container mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
