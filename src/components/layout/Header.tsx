
import { MobileNavigation } from "./MobileNavigation";
import { Bell, Moon, Sun, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

export function Header() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    setTheme(theme === 'dark' ? 'light' : 'dark', e);
  };

  // Use user information if available, otherwise default values
  const userEmail = user?.email || "usuario@sistema.com";
  const userInitial = userEmail ? userEmail[0].toUpperCase() : "U";
  const roleName = user?.role === 'admin' ? 'Administrador' : 
                   user?.role === 'manager' ? 'Gerente' : 
                   user?.role === 'employee' ? 'Funcionário' : 'Usuário';

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center bg-background border-b px-4 lg:px-6">
      <MobileNavigation />
      
      {/* Admin links */}
      {user?.role === 'admin' && (
        <div className="ml-6 hidden md:flex space-x-4">
          <Link to="/cadastro-gerente">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <UserPlus size={16} />
              Cadastrar Gerente
            </Button>
          </Link>
          <Link to="/cadastro-funcionario">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Users size={16} />
              Cadastrar Funcionário
            </Button>
          </Link>
        </div>
      )}
      
      {/* Manager links */}
      {user?.role === 'manager' && (
        <div className="ml-6 hidden md:flex space-x-4">
          <Link to="/cadastro-funcionario">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Users size={16} />
              Cadastrar Funcionário
            </Button>
          </Link>
        </div>
      )}
      
      <div className="ml-auto flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </Button>
        <Button className="p-2 rounded-md hover:bg-accent relative" variant="ghost">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center space-x-2 cursor-pointer">
              <Avatar>
                <AvatarFallback>{userInitial}</AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium">{userEmail}</p>
                <p className="text-xs text-muted-foreground">{roleName}</p>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">Perfil</DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">Configurações</DropdownMenuItem>
            <DropdownMenuSeparator />
            {user?.role === 'admin' && (
              <>
                <DropdownMenuItem className="cursor-pointer">
                  <Link to="/cadastro-gerente" className="flex w-full">
                    Cadastrar Gerente
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Link to="/cadastro-funcionario" className="flex w-full">
                    Cadastrar Funcionário
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            {user?.role === 'manager' && (
              <>
                <DropdownMenuItem className="cursor-pointer">
                  <Link to="/cadastro-funcionario" className="flex w-full">
                    Cadastrar Funcionário
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem 
              className="cursor-pointer text-destructive"
              onClick={handleLogout}
            >
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
