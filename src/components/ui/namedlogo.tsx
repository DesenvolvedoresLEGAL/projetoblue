
import React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";

export interface NamedLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

export function NamedLogo({ className, size = "md", ...props }: NamedLogoProps) {
  const { theme } = useTheme();
  const sizeClasses = {
    sm: "h-8",
    md: "h-16",
    lg: "h-24",
  };

  // Logo branca para o tema escuro (nova imagem) e a logo original para o tema claro
  const logoSrc = theme === 'dark' 
    ? "/lovable-uploads/1fb9015a-7ac3-48df-a42e-2bc47e7aad69.png" 
    : "/lovable-uploads/6e637c63-2cf9-4645-8248-02ba712b8b7c.png";

  return (
    <div className={cn("flex items-center justify-center transition-opacity duration-500", className)} {...props}>
      <img 
        src={logoSrc} 
        alt="BLUE Logo" 
        className={cn(sizeClasses[size], "transition-all duration-500")}
      />
    </div>
  );
}
