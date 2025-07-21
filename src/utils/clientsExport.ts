
import { format } from 'date-fns';

interface Client {
  uuid: string;
  empresa: string;
  responsavel: string;
  telefones: string[];
  cnpj?: string;
  email?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface ClientExportData {
  'ID': string;
  'Empresa': string;
  'Responsável': string;
  'Email': string;
  'Telefones': string;
  'CNPJ': string;
  'Status': string;
  'Data Criação': string;
  'Última Atualização': string;
}

export const exportClientsToCSV = (clients: Client[], filename?: string) => {
  
  
  // Mapear dados para formato de exportação
  const exportData: ClientExportData[] = clients.map((client) => {
    // Formatar telefones
    const telefonesFormatados = client.telefones && client.telefones.length > 0 
      ? client.telefones.join('; ') 
      : 'N/A';
    
    // Determinar status
    const status = client.deleted_at ? 'Inativo' : 'Ativo';
    
    // Formatar datas
    const dataCreated = client.created_at 
      ? format(new Date(client.created_at), 'dd/MM/yyyy HH:mm')
      : 'N/A';
    
    const dataUpdated = client.updated_at 
      ? format(new Date(client.updated_at), 'dd/MM/yyyy HH:mm')
      : 'N/A';

    return {
      'ID': client.uuid,
      'Empresa': client.empresa,
      'Responsável': client.responsavel,
      'Email': client.email || 'N/A',
      'Telefones': telefonesFormatados,
      'CNPJ': client.cnpj || 'N/A',
      'Status': status,
      'Data Criação': dataCreated,
      'Última Atualização': dataUpdated
    };
  });

   // Log primeiros 3 itens

  // Converter para CSV
  const csvContent = convertToCSV(exportData);
  
  // Gerar nome do arquivo
  const finalFilename = filename || `clientes-${format(new Date(), 'yyyy-MM-dd-HHmm')}.csv`;

  // Download do arquivo
  downloadCSV(csvContent, finalFilename);
  
  
  return finalFilename;
};

const convertToCSV = (data: ClientExportData[]): string => {
  if (data.length === 0) return '';
  
  // Obter cabeçalhos
  const headers = Object.keys(data[0]);
  
  // Criar linhas CSV
  const csvRows = [
    headers.join(','), // Cabeçalho
    ...data.map(row => 
      headers.map(header => {
        const value = row[header as keyof ClientExportData];
        // Escapar valores que contêm vírgula ou aspas
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',')
    )
  ];
  
  return csvRows.join('\n');
};

const downloadCSV = (csvContent: string, filename: string) => {
  // Criar BOM para UTF-8 (para compatibilidade com Excel)
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Criar link de download
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  // Adicionar ao DOM, clicar e remover
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Limpar URL object
  URL.revokeObjectURL(url);
};
