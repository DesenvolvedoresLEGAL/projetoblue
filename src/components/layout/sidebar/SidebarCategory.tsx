
import React from "react";

interface SidebarCategoryProps {
  label: string;
  children: React.ReactNode;
}

export const SidebarCategory: React.FC<SidebarCategoryProps> = ({
  label,
  children,
}) => {
  return (
    <div className="mt-4">
      <div className="px-3 py-1">
        <span className="text-xs text-sidebar-foreground/70 font-medium uppercase">
          {label}
        </span>
      </div>
      {children}
    </div>
  );
};
