
import React, { useState } from "react";
import { ThemeToggle } from "../auth/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Bell, Clock, User, Settings, LogOut, Menu, X } from "lucide-react";
import { NamedLogo } from "@/components/ui/namedlogo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface HeaderProps {
  children?: React.ReactNode;
  onToggleSidebar?: () => void;
}

export function Header({ children, onToggleSidebar }: HeaderProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  
  const handleSync = () => {
    setIsSyncing(true);
    toast("Sincronizando...", {
      description: "Atualizando dados com o servidor",
    });
    
    // Simulate sync completion after 2 seconds
    setTimeout(() => {
      setIsSyncing(false);
      toast("Sincronização concluída", {
        description: "Todos os dados estão atualizados",
      });
    }, 2000);
  };

  return (
    <header className="h-16 border-b bg-background z-10 flex items-center px-6 py-3 shadow-md">
      {children}
      <div className="flex-1 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden mr-2"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="ml-2 md:ml-0">
          <NamedLogo size="sm" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          className="relative"
          onClick={() => handleSync()}
          disabled={isSyncing}
        >
          <Clock className={`h-5 w-5 ${isSyncing ? 'animate-spin text-primary' : ''}`} />
          {isSyncing && (
            <span className="absolute top-0 right-0 h-2 w-2 bg-primary rounded-full"></span>
          )}
        </Button>
        
        <ThemeToggle />
        
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-4 h-4 text-[10px] flex items-center justify-center">
            3
          </span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
