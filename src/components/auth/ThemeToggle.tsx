
import React from 'react';
import { Button } from '@/components/ui/button';
import { MoonStar, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    setTheme(theme === 'dark' ? 'light' : 'dark', e);
  };
  
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
    >
      {theme === 'dark' ? <Sun size={20} /> : <MoonStar size={20} />}
    </Button>
  );
};
