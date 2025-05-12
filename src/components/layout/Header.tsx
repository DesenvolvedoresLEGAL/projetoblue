
import React from "react";
import { ThemeToggle } from "../auth/ThemeToggle";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  User, 
  RefreshCw, 
  ChevronDown,
  Package, 
  Link,
  CalendarClock
} from "lucide-react";
import { NamedLogo } from "@/components/ui/namedlogo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  children?: React.ReactNode;
}

export function Header({ children }: HeaderProps) {
  const navigate = useNavigate();
  const syncTime = new Date().toLocaleTimeString();
  const isSyncActive = true; // Replace with actual sync status check

  return (
    <header className="h-16 border-b bg-background shadow-md z-10 flex items-center px-6 py-3 fixed top-0 left-0 right-0">
      {children}
      <div className="flex-1 flex items-center">
        <NamedLogo size="sm" className="cursor-pointer" onClick={() => navigate('/')} />
      </div>
      <div className="flex items-center gap-4">

        {/* New Button with Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" className="bg-[#4D2BFB] hover:bg-[#3D1BEB] text-white">
              <span>+ New</span>
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate('/register-asset')}>
              <Package className="mr-2 h-4 w-4" />
              <span>Register New Asset</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/association')}>
              <Link className="mr-2 h-4 w-4" />
              <span>Link Asset to Client</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/subscriptions/new')}>
              <CalendarClock className="mr-2 h-4 w-4" />
              <span>New Subscription</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <ThemeToggle />
        
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-4 h-4 text-[10px] flex items-center justify-center">
            3
          </span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
