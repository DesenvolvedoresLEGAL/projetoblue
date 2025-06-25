
import React from 'react';
import { Button } from '@/components/ui/button';
import { MoonStar, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeProvider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    setTheme(theme === 'dark' ? 'light' : 'dark', e);
  };
  
  const isLight = theme === 'light';
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="relative overflow-hidden transition-all duration-300 hover:bg-legal-primary/10 dark:hover:bg-legal-secondary/10 legal-focus"
            aria-label={isLight ? 'Ativar modo escuro' : 'Ativar modo claro'}
          >
            <div className="relative w-5 h-5">
              {/* Sun Icon */}
              <Sun 
                size={20} 
                className={`absolute inset-0 transition-all duration-500 ${
                  isLight 
                    ? 'rotate-0 scale-100 opacity-100 text-legal-primary' 
                    : 'rotate-90 scale-0 opacity-0'
                }`}
              />
              {/* Moon Icon */}
              <MoonStar 
                size={20} 
                className={`absolute inset-0 transition-all duration-500 ${
                  !isLight 
                    ? 'rotate-0 scale-100 opacity-100 text-legal-secondary' 
                    : '-rotate-90 scale-0 opacity-0'
                }`}
              />
            </div>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="legal-tooltip">
          <p className="text-sm font-medium">
            {isLight ? 'Ativar modo escuro' : 'Ativar modo claro'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Componente adicional para toggle com texto (para usar em configurações)
export const ThemeToggleWithLabel = () => {
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    setTheme(theme === 'dark' ? 'light' : 'dark', e);
  };
  
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
      <div className="space-y-1">
        <h3 className="text-sm font-medium legal-subtitle">Aparência</h3>
        <p className="text-xs text-muted-foreground">
          Escolha entre tema claro ou escuro
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={toggleTheme}
        className="ml-4 legal-focus"
      >
        {theme === 'light' ? (
          <>
            <MoonStar className="h-4 w-4 mr-2 text-legal-primary" />
            Escuro
          </>
        ) : (
          <>
            <Sun className="h-4 w-4 mr-2 text-legal-secondary" />
            Claro
          </>
        )}
      </Button>
    </div>
  );
};
