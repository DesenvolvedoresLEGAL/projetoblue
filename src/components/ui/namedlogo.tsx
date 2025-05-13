
import React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";

export interface NamedLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  iconOnly?: boolean; // Added iconOnly prop
}

export function NamedLogo({ className, size = "md", iconOnly = false, ...props }: NamedLogoProps) {
  const { theme } = useTheme();
  const sizeClasses = {
    sm: "h-8",
    md: "h-16",
    lg: "h-24",
  };

  // Logo branca para o tema escuro (nova imagem) e a logo original para o tema claro
  const logoSrc = theme === 'dark' 
    ? "/BLUE_AI-removebg-dark.png" 
    : "/BLUE_AI-removebg.png";

  // Use icon-only version if specified
  const iconOnlySrc = theme === 'dark'
    ? "/BLUE_AI-removebg-dark.png" 
    : "/BLUE_AI-removebg.png";

  return (
    <div className={cn("flex items-center justify-center transition-opacity duration-500", className)} {...props}>
      <img 
        src={iconOnly ? iconOnlySrc : logoSrc} 
        alt="BLUE Logo" 
        className={cn(sizeClasses[size], "transition-all duration-500")}
      />
    </div>
  );
}
