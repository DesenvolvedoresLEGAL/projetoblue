
import React from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ToggleGroupProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface ToggleGroupItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export const ToggleGroup: React.FC<ToggleGroupProps> = ({
  value,
  onValueChange,
  children,
  className
}) => {
  return (
    <div 
      className={cn("flex rounded-lg bg-[#F0F3FF] p-1", className)}
      role="group"
    >
      {React.Children.map(children, (child) => 
        React.isValidElement(child) 
          ? React.cloneElement(child as React.ReactElement<ToggleGroupItemProps>, {
              ...child.props,
              selected: value === child.props.value,
              onClick: () => onValueChange(child.props.value)
            })
          : child
      )}
    </div>
  );
};

export const ToggleGroupItem: React.FC<ToggleGroupItemProps & { 
  selected?: boolean; 
  onClick?: () => void; 
}> = ({
  value,
  children,
  selected,
  onClick,
  className
}) => {
  return (
    <Button
      type="button"
      variant={selected ? "default" : "ghost"}
      size="sm"
      onClick={onClick}
      className={cn(
        "flex-1 transition-all duration-200 font-neue-haas",
        selected 
          ? "bg-[#4D2BFB] text-white shadow-sm" 
          : "text-[#020CBC] hover:bg-[#4D2BFB]/10",
        className
      )}
    >
      {children}
    </Button>
  );
};
