
import { cn } from "@/lib/utils";

interface SidebarFooterProps {
  collapsed: boolean;
}

export function SidebarFooter({ collapsed }: SidebarFooterProps) {
  return (
    <div className="border-t p-4 mt-auto">
      <div className="text-xs text-muted-foreground">
        © {new Date().getFullYear()} - LEGAL
        {!collapsed && (
          <>
            <br />
            Ver. 1.0.2
          </>
        )}
      </div>
    </div>
  );
}
