
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="model">Modelo</Label>
        <Input
          id="model"
          name="model"
          value={formData.model || ''}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="serial_number">Número de Série</Label>
        <Input
          id="serial_number"
          name="serial_number"
          value={formData.serial_number || ''}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="radio">Etiqueta / Rádio</Label>
        <Input
          id="radio"
          name="radio"
          value={formData.radio || ''}
          onChange={handleChange}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="rented_days">Dias Alugados</Label>
        <Input
          id="rented_days"
          name="rented_days"
          type="number"
          value={formData.rented_days || '0'}
          onChange={handleChange}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="admin_user">Usuário Admin</Label>
        <Input
          id="admin_user"
          name="admin_user"
          value={formData.admin_user || 'admin'}
          onChange={handleChange}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="admin_pass">Senha Admin</Label>
        <Input
          id="admin_pass"
          name="admin_pass"
          type="password"
          value={formData.admin_pass || ''}
          onChange={handleChange}
          placeholder="Digite para alterar a senha"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ssid_atual">SSID</Label>
        <Input
          id="ssid_atual"
          name="ssid_atual"
          type="text"
          value={formData.ssid_atual || ''}
          onChange={handleChange}
          placeholder="Digite para alterar a senha"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="pass_atual">Senha da rede</Label>
        <Input
          id="pass_atual"
          name="pass_atual"
          type="password"
          value={formData.pass_atual || ''}
          onChange={handleChange}
          placeholder="Digite para alterar a senha"
        />
      </div>
    </>
  );
};

export default DeviceEditForm;
