
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Copy } from "lucide-react";
import { UseFormReturn, type FieldValues } from 'react-hook-form';
import { toast } from "@/utils/toast";

interface AdminCredentialsFieldsProps {
  form: UseFormReturn<FieldValues>;
  isLoading: boolean;
  isMobile: boolean;
  title: string;
  description: string;
  showCopyButton?: boolean;
  onCopyFromFactory?: () => void;
}

export const AdminCredentialsFields = ({ 
  form, 
  isLoading, 
  isMobile, 
  title, 
  description,
  showCopyButton = false,
  onCopyFromFactory
}: AdminCredentialsFieldsProps) => {
  const copyToClipboard = (value: string, label: string) => {
    navigator.clipboard.writeText(value).then(() => {
      toast.success(`${label} copiado para a área de transferência`);
    });
  };

  return (
    <div className={`space-y-4 ${isMobile ? 'p-4' : 'p-6'} rounded-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <h4 className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold text-legal-dark`}>
            {title}
          </h4>
          <p className="text-xs text-muted-foreground">{description}</p>
          <p className="text-xs text-blue-600 mt-1">
            Se não preenchido, usará as credenciais de fábrica
          </p>
        </div>
        {showCopyButton && onCopyFromFactory && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCopyFromFactory}
            className="flex items-center gap-2"
          >
            <Copy className="h-3 w-3" />
            {!isMobile && "Copiar de Fábrica"}
          </Button>
        )}
      </div>

      <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-2 gap-4'}`}>
        <FormField
          control={form.control}
          name="admin_user"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={`text-legal-dark font-semibold ${isMobile ? 'text-sm' : ''}`}>
                Usuário Admin Atual
              </FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input
                    placeholder="admin"
                    disabled={isLoading}
                    {...field}
                    className={`form-input ${isMobile ? 'h-11 text-base' : 'h-10'}`}
                  />
                </FormControl>
                {field.value && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(field.value, 'Usuário Admin')}
                    className="px-2"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Usuário atual para acessar o painel administrativo
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="admin_pass"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={`text-legal-dark font-semibold ${isMobile ? 'text-sm' : ''}`}>
                Senha Admin Atual
              </FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <PasswordInput
                    id="admin_pass"
                    placeholder="Digite a senha admin atual"
                    disabled={isLoading}
                    value={field.value || ''}
                    onChange={field.onChange}
                    className={`form-input ${isMobile ? 'h-11 text-base' : 'h-10'}`}
                  />
                </FormControl>
                {field.value && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(field.value, 'Senha Admin')}
                    className="px-2"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Senha atual para acessar o painel administrativo
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
