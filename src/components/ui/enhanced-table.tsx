
import React from 'react';
import { cn } from '@/lib/utils';

interface EnhancedTableProps {
  children: React.ReactNode;
  className?: string;
}

interface EnhancedTableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface EnhancedTableBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface EnhancedTableRowProps {
  children: React.ReactNode;
  className?: string;
}

interface EnhancedTableCellProps {
  children: React.ReactNode;
  className?: string;
  isHeader?: boolean;
}

/**
 * Enhanced Table component optimized for dark mode following PRD specifications
 * Provides better contrast, visual hierarchy, and proper alternating rows
 */
export const EnhancedTable: React.FC<EnhancedTableProps> = ({ children, className }) => {
  return (
    <div className="overflow-x-auto">
      <table className={cn(
        "w-full enhanced-table border-collapse",
        "bg-background border border-border rounded-lg overflow-hidden",
        className
      )}>
        {children}
      </table>
    </div>
  );
};

export const EnhancedTableHeader: React.FC<EnhancedTableHeaderProps> = ({ children, className }) => {
  return (
    <thead className={cn(
      "bg-muted/50 dark:bg-[hsl(var(--table-header-bg))]",
      className
    )}>
      {children}
    </thead>
  );
};

export const EnhancedTableBody: React.FC<EnhancedTableBodyProps> = ({ children, className }) => {
  return (
    <tbody className={className}>
      {children}
    </tbody>
  );
};

export const EnhancedTableRow: React.FC<EnhancedTableRowProps> = ({ children, className }) => {
  return (
    <tr className={cn(
      "transition-colors duration-200 border-b border-border",
      "hover:bg-muted/30 dark:hover:bg-[hsl(var(--table-row-hover))]",
      "even:bg-muted/10 dark:even:bg-white/[0.02]",
      className
    )}>
      {children}
    </tr>
  );
};

export const EnhancedTableCell: React.FC<EnhancedTableCellProps> = ({ 
  children, 
  className, 
  isHeader = false 
}) => {
  const Tag = isHeader ? 'th' : 'td';
  
  return (
    <Tag className={cn(
      "px-4 py-3 text-left",
      isHeader 
        ? "text-sm font-semibold text-foreground bg-muted/50 dark:bg-[hsl(var(--table-header-bg))] border-b-2 border-border" 
        : "text-sm text-foreground",
      className
    )}>
      {children}
    </Tag>
  );
};
