
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
 * Enhanced Table component optimized for dark mode
 * Provides better contrast and visual hierarchy
 */
export const EnhancedTable: React.FC<EnhancedTableProps> = ({ children, className }) => {
  return (
    <div className="overflow-x-auto">
      <table className={cn("w-full enhanced-table", className)}>
        {children}
      </table>
    </div>
  );
};

export const EnhancedTableHeader: React.FC<EnhancedTableHeaderProps> = ({ children, className }) => {
  return (
    <thead className={className}>
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
    <tr className={cn("transition-colors duration-200", className)}>
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
      isHeader ? "text-sm font-semibold" : "text-sm",
      className
    )}>
      {children}
    </Tag>
  );
};
