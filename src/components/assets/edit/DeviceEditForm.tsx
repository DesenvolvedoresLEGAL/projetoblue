
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface DeviceEditFormProps {
  formData: {
    model?: string;
    serial_number?: string;
    radio?: string;
    rented_days?: number;
    admin_user?: string;
    admin_pass?: string;
  };
  handleChange: (field: string, value: any) => void;
}

const DeviceEditForm = ({ formData, handleChange }: DeviceEditFormProps) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    handleChange(name, type === 'number' ? Number(value) : value);
  };

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="model">Modelo</Label>
        <Input
          id="model"
          name="model"
          value={formData.model || ''}
          onChange={handleInputChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="serial_number">Número de Série</Label>
        <Input
          id="serial_number"
          name="serial_number"
          value={formData.serial_number || ''}
          onChange={handleInputChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="radio">Etiqueta / Rádio</Label>
        <Input
          id="radio"
          name="radio"
          value={formData.radio || ''}
          onChange={handleInputChange}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="rented_days">Dias Alugados</Label>
        <Input
          id="rented_days"
          name="rented_days"
          type="number"
          value={formData.rented_days || 0}
          onChange={handleInputChange}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="admin_user">Usuário Admin</Label>
        <Input
          id="admin_user"
          name="admin_user"
          value={formData.admin_user || 'admin'}
          onChange={handleInputChange}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="admin_pass">Senha Admin</Label>
        <Input
          id="admin_pass"
          name="admin_pass"
          type="password"
          value={formData.admin_pass || ''}
          onChange={handleInputChange}
          placeholder="Digite para alterar a senha"
        />
      </div>
    </>
  );
};

export default DeviceEditForm;
