
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { ModularSidebar } from "./ModularSidebar";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

// Import page components
import Dashboard from "@/pages/Dashboard";
import AssetsManagement from "@/pages/AssetsManagement";
import AssetsInventory from "@/pages/AssetsInventory";
import AssetAssociation from "@/pages/AssetAssociation";
import AssetsAssociations from "@/pages/AssetsAssociations";
import RegisterAsset from "@/pages/RegisterAsset";
import Clients from "@/pages/Clients";
import Export from "@/pages/Export";
import Association from "@/pages/Association";

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const toggleMobileSidebar = () => {
    setMobileOpen((prev) => !prev);
  };

  // Route to component mapping
  const getPageComponent = () => {
    switch (location.pathname) {
      case '/dashboard':
        return <Dashboard />;
      case '/assets':
        return <AssetsManagement />;
      case '/assets/inventory':
        return <AssetsInventory />;
      case '/assets/association':
        return <AssetAssociation />;
      case '/assets/associations':
        return <AssetsAssociations />;
      case '/register-asset':
        return <RegisterAsset />;
      case '/clients':
        return <Clients />;
      case '/export':
        return <Export />;
      case '/association':
        return <Association />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header - fixed at top */}
      <Header className="fixed top-0 left-0 right-0 z-50">
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
      </Header>

      {/* Main layout container */}
      <div className="pt-16 flex min-h-[calc(100vh-64px)]"> {/* Add padding top for header height */}
        {/* Desktop Sidebar - fixed below header */}
        <div className="hidden md:block fixed top-16 left-0 bottom-0 z-40">
          <ModularSidebar />
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

        {/* Main content with proper offsets */}
        <main 
          className="flex-1 md:ml-64 w-full pb-16" 
          role="main" 
          aria-label="Main content"
        >
          <div className="container mx-auto py-6 px-4 min-h-[calc(100vh-144px)]">
            {getPageComponent()}
          </div>
          
          {/* Footer - fixed at bottom of content area */}
          <Footer className="fixed bottom-0 md:left-64 right-0 z-40" />
        </main>
      </div>
    </div>
  );
}
