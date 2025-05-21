
import { ThemeProvider as CustomThemeProvider } from "../context/ThemeContext";
import { ReactNode } from "react";

interface ThemeProviderProps {
  children: ReactNode;
  [key: string]: any; // For additional props that might be passed
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <CustomThemeProvider {...props}>{children}</CustomThemeProvider>
}
