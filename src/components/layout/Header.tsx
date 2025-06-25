
import React from "react";
import { useAuth } from "@/context/AuthProvider";
import { ThemeToggle } from "../auth/ThemeToggle";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  User, 
  LogOut, 
  Settings
} from "lucide-react";
import { NamedLogo } from "@/components/ui/namedlogo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/ui/role-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

export function Header({ children, className, ...props }: HeaderProps) {
  const { signOut, isAuthenticated, userRole } = useAuth();

  return (
    <header 
      className={cn(
        "h-16 border-b border-border bg-background shadow-legal dark:shadow-legal-dark flex items-center px-6 py-3 transition-shadow duration-200",
        className
      )}
      {...props}
    >
      {children}
      <div className="flex-1 flex items-center">
        <NamedLogo size="md" />
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative hover:bg-legal-primary/10 dark:hover:bg-legal-secondary/10">
          <Bell className="h-5 w-5 text-legal-primary dark:text-legal-secondary" />
          <span className="absolute -top-1 -right-1 bg-legal-primary dark:bg-legal-secondary text-white dark:text-bg-primary-dark rounded-full w-4 h-4 text-[10px] flex items-center justify-center font-bold">
            3
          </span>
        </Button>
        
        {/* Role Badge - only show when authenticated */}
        {isAuthenticated && (
          <div className="hidden sm:block">
            <RoleBadge 
              role={userRole} 
              className="shadow-sm" 
              showDescription={false}
            />
          </div>
        )}
        
        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-legal-primary/10 dark:hover:bg-legal-secondary/10">
              <Avatar className="h-8 w-8 border-2 border-legal-primary/20 dark:border-legal-secondary/20">
                <AvatarImage src="/placeholder.svg" alt="User" />
                <AvatarFallback className="bg-legal-primary/10 dark:bg-legal-secondary/10 text-legal-primary dark:text-legal-secondary font-bold">
                  LE
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-56 shadow-legal-lg dark:shadow-legal-dark-lg border border-legal-primary/20 dark:border-legal-secondary/20"
          >
            <DropdownMenuLabel className="text-legal-primary dark:text-legal-secondary font-semibold">
              Minha Conta
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-legal-primary/20 dark:bg-legal-secondary/20" />
            <DropdownMenuGroup>
              <DropdownMenuItem className="hover:bg-legal-primary/10 dark:hover:bg-legal-secondary/10 focus:bg-legal-primary/10 dark:focus:bg-legal-secondary/10">
                <User className="mr-2 h-4 w-4 text-legal-primary dark:text-legal-secondary" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-legal-primary/10 dark:hover:bg-legal-secondary/10 focus:bg-legal-primary/10 dark:focus:bg-legal-secondary/10">
                <Settings className="mr-2 h-4 w-4 text-legal-primary dark:text-legal-secondary" />
                <span>Configurações</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-legal-primary/20 dark:bg-legal-secondary/20" />
            <DropdownMenuItem
              onClick={signOut}
              className="hover:bg-destructive/10 focus:bg-destructive/10 text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
