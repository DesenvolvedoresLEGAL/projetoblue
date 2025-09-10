/* eslint-disable @typescript-eslint/no-explicit-any */
// Type guards and utility functions to handle type errors temporarily

export const isValidStatus = (status: any): status is { id: number; name: string } => {
  return status && typeof status === 'object' && 'name' in status;
};

export const getStatusName = (status: any): string => {
  if (typeof status === 'string') return status;
  if (isValidStatus(status)) return status.name;
  return '';
};

export const isValidSolution = (solution: any): solution is { id: number; solution: string } => {
  return solution && typeof solution === 'object' && 'solution' in solution;
};

export const getSolutionName = (solution: any): string => {
  if (isValidSolution(solution)) return solution.solution;
  return '';
};

export const isValidManufacturer = (manufacturer: any): manufacturer is { id: number; name: string } => {
  return manufacturer && typeof manufacturer === 'object' && 'name' in manufacturer;
};

export const getManufacturerName = (manufacturer: any): string => {
  if (isValidManufacturer(manufacturer)) return manufacturer.name;
  return '';
};

export const isValidClient = (client: any): client is { nome: string; contato: string } => {
  return client && typeof client === 'object' && 'nome' in client && 'contato' in client;
};

export const getClientName = (client: any): string => {
  if (isValidClient(client)) return client.nome;
  return '';
};

export const safeJsonParse = (details: any): Record<string, unknown> | null => {
  if (!details) return null;
  if (typeof details === 'object' && !Array.isArray(details)) return details;
  if (typeof details === 'string') {
    try {
      return JSON.parse(details);
    } catch {
      return null;
    }
  }
  return null;
};