
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { MoonStar, Sun } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { toast } from '@/utils/toast';

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Evita renderização do lado do servidor
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Cria o efeito de ripple
    const ripple = document.createElement('div');
    ripple.style.left = `${e.clientX}px`;
    ripple.style.top = `${e.clientY}px`;
    ripple.classList.add('theme-ripple');
    ripple.classList.add(theme === 'dark' ? 'theme-ripple-light' : 'theme-ripple-dark');
    
    document.body.appendChild(ripple);
    
    // Aplica o efeito de ripple
    ripple.style.width = '0px';
    ripple.style.height = '0px';
    ripple.style.opacity = '1';
    
    // Anima o ripple
    setTimeout(() => {
      const size = Math.max(window.innerWidth, window.innerHeight) * 2;
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      
      setTimeout(() => {
        document.body.classList.add('theme-transition');
        setTheme(theme === 'dark' ? 'light' : 'dark');
        
        toast.success(
          theme === 'dark' ? 'Tema claro ativado' : 'Tema escuro ativado', 
          { position: 'bottom-right', duration: 2000 }
        );
        
        // Remover o ripple após a animação
        setTimeout(() => {
          document.body.removeChild(ripple);
          document.body.classList.remove('theme-transition');
        }, 600);
      }, 300);
    }, 10);
  };
  
  if (!mounted) {
    return null;
  }
  
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      className="transition-colors bg-transparent hover:bg-primary/10"
    >
      {theme === 'dark' ? <Sun size={20} /> : <MoonStar size={20} />}
    </Button>
  );
};
