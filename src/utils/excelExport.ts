
import * as XLSX from 'xlsx';
import { AssetWithRelations } from '@/hooks/useAssetsData';
import { format } from 'date-fns';

export interface ExportData {
  'ID': string;
  'Tipo': string;
  'Status': string;
  'Operadora/Fabricante': string;
  'ICCID/Rádio': string;
  'Número/Serial': string;
  'Modelo': string;
  'Dias Alugado': number;
  'Data Criação': string;
}

export const exportToExcel = (assets: AssetWithRelations[], filename?: string) => {
  console.log('Iniciando exportação de', assets.length, 'ativos');
  
  // Mapear dados para formato de exportação
  const exportData: ExportData[] = assets.map((asset) => {
    // Obter nome do fabricante/operadora
    let operadoraFabricante = 'N/A';
    if (asset.manufacturer?.name) {
      operadoraFabricante = asset.manufacturer.name;
    }
    
    // Determinar identificador principal baseado no tipo de solução
    let iccidRadio = 'N/A';
    let numeroSerial = 'N/A';
    
    if (asset.solucao === 'CHIP' || asset.solution_id === 11) {
      // Para CHIPs, usar ICCID como identificador principal
      iccidRadio = asset.iccid || 'N/A';
      numeroSerial = asset.line_number?.toString() || 'N/A';
    } else {
      // Para equipamentos, usar rádio como identificador principal
      iccidRadio = asset.radio || 'N/A';
      numeroSerial = asset.serial_number || 'N/A';
    }
    
    // Formatar data de criação
    const dataCreated = asset.created_at 
      ? format(new Date(asset.created_at), 'dd/MM/yyyy HH:mm')
      : 'N/A';

    return {
      'ID': asset.uuid,
      'Tipo': asset.solucao || 'N/A',
      'Status': asset.status?.status || 'N/A',
      'Operadora/Fabricante': operadoraFabricante,
      'ICCID/Rádio': iccidRadio,
      'Número/Serial': numeroSerial,
      'Modelo': asset.model || 'N/A',
      'Dias Alugado': asset.rented_days || 0,
      'Data Criação': dataCreated
    };
  });

  console.log('Dados preparados para exportação:', exportData.slice(0, 3)); // Log primeiros 3 itens

  // Criar workbook e worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(exportData);

  // Ajustar largura das colunas
  const columnWidths = [
    { wch: 35 }, // ID
    { wch: 15 }, // Tipo
    { wch: 15 }, // Status
    { wch: 20 }, // Operadora/Fabricante
    { wch: 25 }, // ICCID/Rádio
    { wch: 20 }, // Número/Serial
    { wch: 15 }, // Modelo
    { wch: 12 }, // Dias Alugado
    { wch: 18 }, // Data Criação
  ];
  
  worksheet['!cols'] = columnWidths;

  // Adicionar worksheet ao workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventário de Ativos');

  // Gerar nome do arquivo
  const finalFilename = filename || `inventario-ativos-${format(new Date(), 'yyyy-MM-dd-HHmm')}.xlsx`;

  // Salvar arquivo
  XLSX.writeFile(workbook, finalFilename);
  
  console.log('Exportação concluída:', finalFilename);
  return finalFilename;
};
