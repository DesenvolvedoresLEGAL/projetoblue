
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ChevronDown, ChevronRight, Package, LayoutDashboard, PackageSearch, Users, Building, Clock, History, ActivitySquare, PlusCircle, Link, Database, Wifi, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";
import { NamedLogo } from "@/components/ui/namedlogo";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export function MobileNavigation() {
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({
    inventario: false
  });

  const toggleModule = (moduleId: string) => {
    setOpenModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="md:hidden"
          aria-label="Menu de Navegação"
        >
          <Menu size={16} />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[240px] sm:w-[300px] p-0">
        <div className="flex h-16 items-center border-b p-4">
          <NamedLogo size="sm" />
        </div>
        <nav className="flex flex-col gap-2 p-4">
          {/* Home link */}
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`
            }
          >
            <Home size={16} />
            <span>Home</span>
          </NavLink>
          
          {/* Inventário Module */}
          <div className="mb-2">
            <Collapsible
              open={openModules.inventario}
              onOpenChange={() => toggleModule('inventario')}
              className="w-full"
            >
              <CollapsibleTrigger
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm",
                  "hover:bg-muted"
                )}
              >
                <div className="flex items-center gap-2">
                  <Package size={16} />
                  <span>Inventário</span>
                </div>
                {openModules.inventario ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </CollapsibleTrigger>
              
              <CollapsibleContent className="pl-6 pt-1 flex flex-col gap-1">
                <NavLink
                  to="/inventario/dashboard"
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`
                  }
                >
                  <LayoutDashboard size={16} />
                  <span>Dashboard</span>
                </NavLink>
                
                <NavLink
                  to="/inventario/ativos"
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`
                  }
                >
                  <PackageSearch size={16} />
                  <span>Ativos</span>
                </NavLink>
                
                <NavLink
                  to="/inventario/clientes"
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`
                  }
                >
                  <Users size={16} />
                  <span>Clientes</span>
                </NavLink>
                
                <NavLink
                  to="/inventario/fornecedores"
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`
                  }
                >
                  <Building size={16} />
                  <span>Fornecedores</span>
                </NavLink>
                
                <NavLink
                  to="/inventario/assinaturas"
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`
                  }
                >
                  <Clock size={16} />
                  <span>Assinaturas</span>
                </NavLink>
                
                <NavLink
                  to="/inventario/historico"
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`
                  }
                >
                  <History size={16} />
                  <span>Histórico</span>
                </NavLink>
                
                <NavLink
                  to="/inventario/monitoramento"
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`
                  }
                >
                  <ActivitySquare size={16} />
                  <span>Monitoramento</span>
                </NavLink>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Additional links */}
          <NavLink
            to="/register-asset"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`
            }
          >
            <PlusCircle size={16} />
            <span>Cadastrar Ativo</span>
          </NavLink>
          
          <NavLink
            to="/association"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`
            }
          >
            <Link size={16} />
            <span>Vincular Ativos</span>
          </NavLink>
          
          <NavLink
            to="/data-usage"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`
            }
          >
            <Database size={16} />
            <span>Consumo de Dados</span>
          </NavLink>
          
          <NavLink
            to="/wifi-analyzer"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`
            }
          >
            <Wifi size={16} />
            <span>WiFi Analyzer</span>
          </NavLink>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
