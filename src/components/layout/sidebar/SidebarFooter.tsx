
interface SidebarFooterProps {
  isCollapsed: boolean;
}

export function SidebarFooter({ isCollapsed }: SidebarFooterProps) {
  return (
    <div className="border-t border-gray-200 dark:border-gray-800 p-4">
      {!isCollapsed && (
        <div className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} - LEGAL
          <br />
          BLUE Platform v1.0.2
        </div>
      )}
    </div>
  );
}
