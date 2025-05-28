
// Função para formatar número de telefone
export const formatPhoneNumber = (phoneNumberString: string): string => {
  const cleaned = ('' + phoneNumberString).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3];
  }
  return phoneNumberString;
};

// Função para formatar CNPJ
export const formatCNPJ = (cnpj: string): string => {
  const cleaned = ('' + cnpj).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/);
  if (match) {
    return match[1] + '.' + match[2] + '.' + match[3] + '/' + match[4] + '-' + match[5];
  }
  return cnpj;
};

// Função para obter o nome do arquivo a partir do caminho
export const getFileNameFromPath = (path: string): string => {
  return path.split('/').pop() || 'Arquivo';
};

// Função para formatar a data
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

// Função para formatar a data e hora
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('pt-BR');
};

// Função para converter bytes em formato legível (KB, MB, GB, TB)
export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Função para obter a diferença em dias entre duas datas
export const getDaysDifference = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end.getTime() - start.getTime();
  return Math.ceil(diff / (1000 * 3600 * 24));
};

// Função para verificar se uma data é válida
export const isValidDate = (dateString: string): boolean => {
  return !isNaN(new Date(dateString).getTime());
};

// Função para capitalizar primeira letra de uma string
export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Função melhorada para obter identificador do ativo
export const getAssetIdentifier = (asset: any): string => {
  // Verificar se é um objeto de associação (tem asset_solution_name)
  if (asset.asset_solution_name) {
    if (asset.asset_solution_name?.toUpperCase() === "CHIP" || asset.asset_solution_id === 11) {
      return asset.asset_line_number?.toString() || asset.asset_iccid || "N/A";
    }
    return asset.asset_radio || "N/A";
  }
  
  // Lógica original para objetos de ativo direto
  if (asset.solucao?.toUpperCase() === "CHIP" || asset.solution_id === 11) {
    return asset.line_number?.toString() || asset.iccid || "N/A";
  }
  return asset.radio || "N/A";
};
