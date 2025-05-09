
import { Outlet } from "react-router-dom";
import { ModularSidebar } from "./ModularSidebar";
import { Header } from "./Header";

export function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar wrapper */}
      <div className="hidden md:flex">
        <ModularSidebar />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 w-full">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto py-6 px-4 max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
