
import React from 'react';
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "@/utils/toast";

interface CopyableFieldProps {
  value: string | undefined;
  label: string;
  isPassword?: boolean;
  showPasswords?: boolean;
  className?: string;
}

export const CopyableField: React.FC<CopyableFieldProps> = ({
  value,
  label,
  isPassword = false,
  showPasswords = false,
  className = ""
}) => {
  const copyToClipboard = (value: string, label: string) => {
    navigator.clipboard.writeText(value).then(() => {
      toast.success(`${label} copiado para a área de transferência`);
    });
  };

  if (!value) return <span className="text-sm">N/A</span>;
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className={`${isPassword ? 'font-mono' : ''} text-sm`}>
        {isPassword && !showPasswords ? '•'.repeat(value.length) : value}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => copyToClipboard(value, label)}
        className="h-6 w-6 p-0"
      >
        <Copy className="h-3 w-3" />
      </Button>
    </div>
  );
};
