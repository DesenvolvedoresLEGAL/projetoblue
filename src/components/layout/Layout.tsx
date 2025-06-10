
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { ModularSidebar } from "./ModularSidebar";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setMobileOpen((prev) => !prev);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background transition-colors duration-300">
      {/* Header - fixed at top */}
      <Header className="fixed top-0 left-0 right-0 z-50">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden mr-2 hover:bg-legal-primary/10 dark:hover:bg-legal-secondary/10"
          onClick={toggleMobileSidebar}
          aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-sidebar"
        >
          <Menu className="h-5 w-5 text-legal-primary dark:text-legal-secondary" />
          <span className="sr-only">Alternar menu</span>
        </Button>
      </Header>

      {/* Main layout container */}
      <div className="pt-16 flex min-h-[calc(100vh-64px)]"> {/* Add padding top for header height */}
        {/* Desktop Sidebar - fixed below header */}
        <div className="hidden md:block fixed top-16 left-0 bottom-0 z-40">
          <ModularSidebar />
        </div>

        {/* Mobile Sidebar - shown when mobileOpen is true */}
        <div 
          className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
            mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300" 
            onClick={toggleMobileSidebar}
            aria-hidden="true"
          />
          
          {/* Sidebar */}
          <div 
            className={`fixed inset-y-0 left-0 w-full max-w-xs transition-transform duration-300 ease-in-out ${
              mobileOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <ModularSidebar isMobile={true} onClose={toggleMobileSidebar} />
          </div>
        </div>

        {/* Main content with proper offsets */}
        <main 
          className="flex-1 md:ml-64 w-full pb-16 transition-all duration-300" 
          role="main" 
          aria-label="Conteúdo principal"
        >
          <div className="container mx-auto py-6 px-4 min-h-[calc(100vh-144px)]">
            <Outlet />
          </div>
          
          {/* Footer - fixed at bottom of content area */}
          <Footer className="fixed bottom-0 md:left-64 right-0 z-40" />
        </main>
      </div>
    </div>
  );
}
