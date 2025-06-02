
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Copy, Eye, EyeOff } from "lucide-react";
import { UseFormReturn } from 'react-hook-form';
import { toast } from "@/utils/toast";

interface NetworkFieldsProps {
  form: UseFormReturn<any>;
  isLoading: boolean;
  isMobile: boolean;
  fieldPrefix: 'fabrica' | 'atual';
  title: string;
  description: string;
  showCopyButton?: boolean;
  onCopyFromFactory?: () => void;
}

export const NetworkFields = ({ 
  form, 
  isLoading, 
  isMobile, 
  fieldPrefix, 
  title, 
  description,
  showCopyButton = false,
  onCopyFromFactory
}: NetworkFieldsProps) => {
  const copyToClipboard = (value: string, label: string) => {
    navigator.clipboard.writeText(value).then(() => {
      toast.success(`${label} copiado para a área de transferência`);
    });
  };

  return (
    <div className={`space-y-4 ${isMobile ? 'p-4' : 'p-6'} rounded-lg border`}>
      <div className="flex items-center justify-between">
        <div>
          <h4 className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold text-legal-dark`}>
            {title}
          </h4>
          <p className="text-xs text-muted-foreground">{description}</p>
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
          name={`ssid_${fieldPrefix}`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className={`text-legal-dark font-semibold ${isMobile ? 'text-sm' : ''}`}>
                SSID (Nome da Rede) {fieldPrefix === 'fabrica' ? '*' : ''}
              </FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input
                    placeholder="Ex: TP-Link_2.4GHz"
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
                    onClick={() => copyToClipboard(field.value, 'SSID')}
                    className="px-2"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Nome da rede WiFi {fieldPrefix === 'fabrica' ? 'original' : 'atual'}
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`pass_${fieldPrefix}`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className={`text-legal-dark font-semibold ${isMobile ? 'text-sm' : ''}`}>
                Senha WiFi {fieldPrefix === 'fabrica' ? '*' : ''}
              </FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <div className="relative">
                    <PasswordInput
                      id={`pass_${fieldPrefix}`}
                      placeholder="Digite a senha da rede"
                      disabled={isLoading}
                      value={field.value || ''}
                      onChange={field.onChange}
                      className={`form-input ${isMobile ? 'h-11 text-base' : 'h-10'}`}
                    />
                  </div>
                </FormControl>
                {field.value && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(field.value, 'Senha WiFi')}
                    className="px-2"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Senha para conectar na rede WiFi
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`admin_user_${fieldPrefix}`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className={`text-legal-dark font-semibold ${isMobile ? 'text-sm' : ''}`}>
                Usuário Admin {fieldPrefix === 'fabrica' ? '*' : ''}
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
                Usuário para acessar o painel administrativo
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`admin_pass_${fieldPrefix}`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className={`text-legal-dark font-semibold ${isMobile ? 'text-sm' : ''}`}>
                Senha Admin {fieldPrefix === 'fabrica' ? '*' : ''}
              </FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <PasswordInput
                    id={`admin_pass_${fieldPrefix}`}
                    placeholder="Digite a senha admin"
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
                Senha para acessar o painel administrativo
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
