
import React from "react";
import { ThemeToggle } from "../auth/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Bell, User } from "lucide-react";

interface HeaderProps {
  children?: React.ReactNode;
}

export function Header({ children }: HeaderProps) {
  return (
    <header className="h-16 border-b bg-background z-10 flex items-center px-4">
      {children}
      <div className="flex-1">
        <div className="text-lg font-medium">
          Telecom Asset Nexus
        </div>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-4 h-4 text-[10px] flex items-center justify-center">
            3
          </span>
        </Button>
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
