
import { Client, ClientFormData } from '@/types/client';

// Mapear dados do banco para o frontend
export const mapDatabaseClientToFrontend = (dbClient: any): Client => {
  return {
    uuid: dbClient.uuid,
    empresa: dbClient.empresa || dbClient.nome, // Fallback para dados legados
    responsavel: dbClient.responsavel || 'Responsável não informado',
    telefones: Array.isArray(dbClient.telefones) ? dbClient.telefones : 
               dbClient.telefones ? JSON.parse(dbClient.telefones) : 
               dbClient.contato ? [dbClient.contato.toString()] : [],
    email: dbClient.email || '',
    cnpj: dbClient.cnpj,
    created_at: dbClient.created_at,
    updated_at: dbClient.updated_at,
    deleted_at: dbClient.deleted_at,
    // Campos legados para compatibilidade
    nome: dbClient.nome,
    contato: dbClient.contato
  };
};

// Mapear dados do form para inserção no banco
export const mapFormDataToDatabase = (formData: ClientFormData) => {
  return {
    empresa: formData.empresa.trim(),
    responsavel: formData.responsavel.trim(),
    telefones: JSON.stringify(formData.telefones.filter(tel => tel.trim())),
    email: formData.email?.trim() || null,
    cnpj: formData.cnpj?.trim() || null
  };
};

// Formatar telefone para exibição
export const formatPhoneForDisplay = (phone: string): string => {
  const numbers = phone.replace(/\D/g, '');
  if (numbers.length === 11) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  }
  if (numbers.length === 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  }
  return phone;
};

// Normalizar telefone para armazenamento
export const normalizePhoneForStorage = (phone: string): string => {
  return phone.replace(/\D/g, '');
};
