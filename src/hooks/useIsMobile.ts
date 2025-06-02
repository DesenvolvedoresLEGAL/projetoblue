
import { useState, useEffect } from "react";

// Breakpoint padrão de 768px (tablets e menores)
export function useIsMobile(breakpoint: number = 768): boolean {
  const [isMobile, setIsMobile] = useState(() => 
    typeof window !== "undefined" && window.innerWidth < breakpoint
  );

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < breakpoint);
    }

    window.addEventListener("resize", handleResize);
    // Também para SSR: verifica no mount
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isMobile;
}
