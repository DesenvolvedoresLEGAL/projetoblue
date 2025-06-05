
import { useState } from 'react';

interface ChipData {
  iccid: string;
  phoneNumber: string;
  carrier: string;
}

interface RouterData {
  uniqueId: string;
  brand: string;
  model: string;
  ssid: string;
  password: string;
  ipAddress?: string;
  adminUser?: string;
  adminPassword?: string;
  imei?: string;
  serialNumber?: string;
}

export const useAssetFormValidation = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validateChipData = (chipData: ChipData): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!chipData.iccid?.trim()) {
      newErrors.iccid = "ICCID é obrigatório";
    }
    
    if (!chipData.phoneNumber?.trim()) {
      newErrors.phoneNumber = "Número do telefone é obrigatório";
    }
    
    if (!chipData.carrier?.trim()) {
      newErrors.carrier = "Operadora é obrigatória";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const validateRouterData = (routerData: RouterData): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!routerData.uniqueId?.trim()) {
      newErrors.uniqueId = "ID único é obrigatório";
    }
    
    if (!routerData.brand?.trim()) {
      newErrors.brand = "Marca é obrigatória";
    }
    
    if (!routerData.model?.trim()) {
      newErrors.model = "Modelo é obrigatório";
    }
    
    if (!routerData.ssid?.trim()) {
      newErrors.ssid = "SSID é obrigatório";
    }
    
    if (!routerData.password?.trim()) {
      newErrors.password = "Senha é obrigatória";
    }
    
    // IP Address validation (IPv4 format)
    if (routerData.ipAddress && !/^(\d{1,3}\.){3}\d{1,3}$/.test(routerData.ipAddress)) {
      newErrors.ipAddress = "Formato de IP inválido (ex: 192.168.0.1)";
    }
    
    // Admin user validation (min 3 chars, only letters, numbers, hyphens, underscores)
    if (routerData.adminUser && !/^[a-zA-Z0-9_-]{3,}$/.test(routerData.adminUser)) {
      newErrors.adminUser = "Usuário deve ter no mínimo 3 caracteres (letras, números, hífens e sublinhados)";
    }
    
    // Admin password validation (min 8 chars, letters, numbers, at least one special char)
    if (routerData.adminPassword && !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(routerData.adminPassword)) {
      newErrors.adminPassword = "Senha deve ter no mínimo 8 caracteres, incluindo letras, números e pelo menos um caractere especial";
    }
    
    // IMEI validation (exactly 15 digits)
    if (routerData.imei && !/^\d{15}$/.test(routerData.imei)) {
      newErrors.imei = "IMEI deve conter exatamente 15 dígitos numéricos";
    }
    
    // Serial Number validation (5-30 alphanumeric chars)
    if (routerData.serialNumber && !/^[a-zA-Z0-9]{5,30}$/.test(routerData.serialNumber)) {
      newErrors.serialNumber = "Número de série deve ter entre 5 e 30 caracteres alfanuméricos";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  return {
    errors,
    validateChipData,
    validateRouterData
  };
};
