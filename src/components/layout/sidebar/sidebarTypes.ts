
import { LucideIcon } from "lucide-react";

export interface SubItem {
  title: string;
  path: string;
  icon: LucideIcon;
}

export interface SidebarModule {
  id: string;
  title: string;
  icon: LucideIcon;
  path?: string;
  isExpandable: boolean;
  subItems?: SubItem[];
}

export interface ModularSidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}
