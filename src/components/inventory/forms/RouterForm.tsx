
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Hash, Briefcase, Monitor, Wifi, KeyRound } from "lucide-react";

interface RouterFormProps {
  routerData: {
    uniqueId: string;
    brand: string;
    model: string;
    ssid: string;
    password: string;
    ipAddress: string;
    adminUser: string;
    adminPassword: string;
    imei: string;
    serialNumber: string;
  };
  setRouterData: React.Dispatch<React.SetStateAction<{
    uniqueId: string;
    brand: string;
    model: string;
    ssid: string;
    password: string;
    ipAddress: string;
    adminUser: string;
    adminPassword: string;
    imei: string;
    serialNumber: string;
  }>>;
  errors: Record<string, string>;
}

const RouterForm = ({ routerData, setRouterData, errors }: RouterFormProps) => {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="uniqueId" className="flex items-center gap-1">
          <Hash className="h-4 w-4" />
          ID Único
        </Label>
        <Input
          id="uniqueId"
          value={routerData.uniqueId}
          onChange={(e) => setRouterData({ ...routerData, uniqueId: e.target.value })}
          className={errors.uniqueId ? "border-red-500" : ""}
        />
        {errors.uniqueId && <p className="text-xs text-red-500">{errors.uniqueId}</p>}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="brand" className="flex items-center gap-1">
            <Briefcase className="h-4 w-4" />
            Marca
          </Label>
          <Input
            id="brand"
            value={routerData.brand}
            onChange={(e) => setRouterData({ ...routerData, brand: e.target.value })}
            className={errors.brand ? "border-red-500" : ""}
          />
          {errors.brand && <p className="text-xs text-red-500">{errors.brand}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="model" className="flex items-center gap-1">
            <Monitor className="h-4 w-4" />
            Modelo
          </Label>
          <Input
            id="model"
            value={routerData.model}
            onChange={(e) => setRouterData({ ...routerData, model: e.target.value })}
            className={errors.model ? "border-red-500" : ""}
          />
          {errors.model && <p className="text-xs text-red-500">{errors.model}</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ssid" className="flex items-center gap-1">
            <Wifi className="h-4 w-4" />
            SSID
          </Label>
          <Input
            id="ssid"
            value={routerData.ssid}
            onChange={(e) => setRouterData({ ...routerData, ssid: e.target.value })}
            className={errors.ssid ? "border-red-500" : ""}
          />
          {errors.ssid && <p className="text-xs text-red-500">{errors.ssid}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password" className="flex items-center gap-1">
            <KeyRound className="h-4 w-4" />
            Senha
          </Label>
          <Input
            id="password"
            type="password"
            value={routerData.password}
            onChange={(e) => setRouterData({ ...routerData, password: e.target.value })}
            className={errors.password ? "border-red-500" : ""}
          />
          {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="ipAddress" className="flex items-center gap-1">
          <Monitor className="h-4 w-4" />
          IP Gerência
        </Label>
        <Input
          id="ipAddress"
          value={routerData.ipAddress}
          onChange={(e) => setRouterData({ ...routerData, ipAddress: e.target.value })}
          className={errors.ipAddress ? "border-red-500" : ""}
        />
        {errors.ipAddress && <p className="text-xs text-red-500">{errors.ipAddress}</p>}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="adminUser" className="flex items-center gap-1">
            <KeyRound className="h-4 w-4" />
            Usuário administrador
          </Label>
          <Input
            id="adminUser"
            value={routerData.adminUser}
            onChange={(e) => setRouterData({ ...routerData, adminUser: e.target.value })}
            className={errors.adminUser ? "border-red-500" : ""}
          />
          {errors.adminUser && <p className="text-xs text-red-500">{errors.adminUser}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="adminPassword" className="flex items-center gap-1">
            <KeyRound className="h-4 w-4" />
            Senha de administrador
          </Label>
          <Input
            id="adminPassword"
            type="password"
            value={routerData.adminPassword}
            onChange={(e) => setRouterData({ ...routerData, adminPassword: e.target.value })}
            className={errors.adminPassword ? "border-red-500" : ""}
          />
          {errors.adminPassword && <p className="text-xs text-red-500">{errors.adminPassword}</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="imei" className="flex items-center gap-1">
            <Hash className="h-4 w-4" />
            IMEI
          </Label>
          <Input
            id="imei"
            value={routerData.imei}
            onChange={(e) => setRouterData({ ...routerData, imei: e.target.value })}
            className={errors.imei ? "border-red-500" : ""}
          />
          {errors.imei && <p className="text-xs text-red-500">{errors.imei}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="serialNumber" className="flex items-center gap-1">
            <Hash className="h-4 w-4" />
            SN (Número de Série)
          </Label>
          <Input
            id="serialNumber"
            value={routerData.serialNumber}
            onChange={(e) => setRouterData({ ...routerData, serialNumber: e.target.value })}
            className={errors.serialNumber ? "border-red-500" : ""}
          />
          {errors.serialNumber && <p className="text-xs text-red-500">{errors.serialNumber}</p>}
        </div>
      </div>
    </div>
  );
};

export default RouterForm;
