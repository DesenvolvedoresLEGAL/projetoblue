
import * as XLSX from 'xlsx';
import { Asset, Client, ChipAsset, RouterAsset } from '@/types/asset';

interface ExcelExportData {
  assets: Asset[];
  clients: Client[];
}

export const exportToExcel = ({ assets, clients }: ExcelExportData) => {
  // Create workbook
  const workbook = XLSX.utils.book_new();
  
  // Assets worksheet
  const assetsData = assets.map(asset => {
    const baseData = {
      'ID': asset.id,
      'Tipo': asset.type,
      'Status': asset.status,
      'Data de Registro': new Date(asset.registrationDate).toLocaleDateString('pt-BR'),
      'Observações': asset.notes || ''
    };
    
    if (asset.type === 'CHIP') {
      const chip = asset as ChipAsset;
      return {
        ...baseData,
        'ICCID': chip.iccid,
        'Número': chip.phoneNumber,
        'Operadora': chip.carrier
      };
    } else {
      const router = asset as RouterAsset;
      return {
        ...baseData,
        'Marca': router.brand,
        'Modelo': router.model,
        'SSID': router.ssid,
        'Número de Série': router.serialNumber
      };
    }
  });
  
  const assetsWorksheet = XLSX.utils.json_to_sheet(assetsData);
  XLSX.utils.book_append_sheet(workbook, assetsWorksheet, 'Ativos');
  
  // Clients worksheet
  const clientsData = clients.map(client => ({
    'ID': client.id,
    'Nome': client.nome,
    'CNPJ': client.cnpj,
    'Contato': client.contato,
    'Email': client.email || '',
    'Endereço': '-', // Not available in current schema
    'Cidade': '-', // Not available in current schema
    'Estado': '-', // Not available in current schema
    'CEP': '-' // Not available in current schema
  }));
  
  const clientsWorksheet = XLSX.utils.json_to_sheet(clientsData);
  XLSX.utils.book_append_sheet(workbook, clientsWorksheet, 'Clientes');
  
  // Download file
  const fileName = `inventario_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};
