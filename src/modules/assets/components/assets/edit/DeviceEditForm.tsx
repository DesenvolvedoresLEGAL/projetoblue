
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useIsMobile } from '@/hooks/useIsMobile';

interface DeviceEditFormProps {
  formData: {
    model?: string;
    serial_number?: string;
    radio?: string;
    rented_days?: string;
    admin_user?: string;
    admin_pass?: string;
    ssid_atual?: string;
    pass_atual?: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const DeviceEditForm = ({ formData, handleChange }: DeviceEditFormProps) => {
  const isMobile = useIsMobile();
  
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="model" className={isMobile ? 'text-base font-medium' : ''}>
          Modelo
        </Label>
        <Input
          id="model"
          name="model"
          value={formData.model || ''}
          onChange={handleChange}
          className={isMobile ? 'h-12 text-base' : ''}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="serial_number" className={isMobile ? 'text-base font-medium' : ''}>
          Número de Série
        </Label>
        <Input
          id="serial_number"
          name="serial_number"
          value={formData.serial_number || ''}
          onChange={handleChange}
          className={isMobile ? 'h-12 text-base' : ''}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="radio" className={isMobile ? 'text-base font-medium' : ''}>
          Etiqueta / Rádio
        </Label>
        <Input
          id="radio"
          name="radio"
          value={formData.radio || ''}
          onChange={handleChange}
          className={isMobile ? 'h-12 text-base' : ''}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="rented_days" className={isMobile ? 'text-base font-medium' : ''}>
          Dias Alugados
        </Label>
        <Input
          id="rented_days"
          name="rented_days"
          type="number"
          value={formData.rented_days || '0'}
          onChange={handleChange}
          className={isMobile ? 'h-12 text-base' : ''}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="admin_user" className={isMobile ? 'text-base font-medium' : ''}>
          Usuário Admin
        </Label>
        <Input
          id="admin_user"
          name="admin_user"
          value={formData.admin_user || 'admin'}
          onChange={handleChange}
          className={isMobile ? 'h-12 text-base' : ''}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="admin_pass" className={isMobile ? 'text-base font-medium' : ''}>
          Senha Admin
        </Label>
        <Input
          id="admin_pass"
          name="admin_pass"
          type="password"
          value={formData.admin_pass || ''}
          onChange={handleChange}
          placeholder="Digite para alterar a senha"
          className={isMobile ? 'h-12 text-base' : ''}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ssid_atual" className={isMobile ? 'text-base font-medium' : ''}>
          SSID
        </Label>
        <Input
          id="ssid_atual"
          name="ssid_atual"
          type="text"
          value={formData.ssid_atual || ''}
          onChange={handleChange}
          placeholder="Digite para alterar a senha"
          className={isMobile ? 'h-12 text-base' : ''}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="pass_atual" className={isMobile ? 'text-base font-medium' : ''}>
          Senha da rede
        </Label>
        <Input
          id="pass_atual"
          name="pass_atual"
          type="password"
          value={formData.pass_atual || ''}
          onChange={handleChange}
          placeholder="Digite para alterar a senha"
          className={isMobile ? 'h-12 text-base' : ''}
        />
      </div>
    </>
  );
};

export default DeviceEditForm;
