
import { v4 as uuidv4 } from 'uuid';

// Interface definitions for the ticket system
export interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'pending' | 'waiting_client' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  category: string;
  createdAt: string;
  updatedAt: string;
  assigneeId?: string;
  customerId: string;
  customerName: string;
  tags: string[];
}

export interface TicketComment {
  id: string;
  ticketId: string;
  content: string;
  createdAt: string;
  authorId: string;
  authorName: string;
  isInternal: boolean;
}

// Mock data for development
const mockTickets: Ticket[] = [
  {
    id: 'T-2024-001',
    subject: 'Problema de conectividade WiFi no escritório principal',
    description: 'Cliente relatando problemas intermitentes de conectividade WiFi em todos os dispositivos.',
    status: 'open',
    priority: 'high',
    category: 'Conectividade',
    createdAt: '2024-01-15T09:30:00Z',
    updatedAt: '2024-01-15T09:30:00Z',
    assigneeId: 'user-001',
    customerId: 'client-001',
    customerName: 'TechCorp Ltda',
    tags: ['wifi', 'conectividade', 'urgente']
  },
  {
    id: 'T-2024-002',
    subject: 'Solicitação de novo equipamento router',
    description: 'Cliente precisa de upgrade do equipamento atual para comportar expansão da rede.',
    status: 'in_progress',
    priority: 'medium',
    category: 'Equipamentos',
    createdAt: '2024-01-15T08:15:00Z',
    updatedAt: '2024-01-15T10:20:00Z',
    assigneeId: 'user-002',
    customerId: 'client-002',
    customerName: 'Inovações S.A.',
    tags: ['equipamento', 'router', 'upgrade']
  },
  {
    id: 'T-2024-003',
    subject: 'Configuração de SSID personalizada',
    description: 'Configuração de rede personalizada para ambiente corporativo com múltiplos pontos de acesso.',
    status: 'pending',
    priority: 'low',
    category: 'Configuração',
    createdAt: '2024-01-14T16:45:00Z',
    updatedAt: '2024-01-15T11:30:00Z',
    customerId: 'client-003',
    customerName: 'StartupXYZ',
    tags: ['configuração', 'ssid', 'personalização']
  }
];

const mockComments: TicketComment[] = [
  {
    id: 'comment-001',
    ticketId: 'T-2024-001',
    content: 'Iniciando diagnóstico do problema de conectividade. Vou verificar os logs do equipamento.',
    createdAt: '2024-01-15T10:15:00Z',
    authorId: 'user-001',
    authorName: 'João Silva',
    isInternal: true
  },
  {
    id: 'comment-002',
    ticketId: 'T-2024-001',
    content: 'Identificamos interferência no canal WiFi. Recomendamos alterar para o canal 6 ou 11.',
    createdAt: '2024-01-15T11:30:00Z',
    authorId: 'user-001',
    authorName: 'João Silva',
    isInternal: false
  }
];

// Service functions
export const fetchTickets = async (filters?: Partial<Ticket>): Promise<Ticket[]> => {
  // In a real implementation, this would call the API
  
  
  // Wait to simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return all tickets or filter them based on criteria
  if (!filters) {
    return mockTickets;
  }
  
  return mockTickets.filter(ticket => {
    return Object.entries(filters).every(([key, value]) => {
      // @ts-expect-error - dynamic key access
      return ticket[key] === value;
    });
  });
};

export const fetchTicketById = async (id: string): Promise<Ticket | null> => {
  // In a real implementation, this would call the API
  
  
  // Wait to simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const ticket = mockTickets.find(t => t.id === id);
  return ticket || null;
};

export const createTicket = async (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>): Promise<Ticket> => {
  // In a real implementation, this would call the API
  
  
  // Wait to simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const now = new Date().toISOString();
  const newTicket: Ticket = {
    ...ticketData,
    id: `T-${new Date().getFullYear()}-${String(mockTickets.length + 1).padStart(3, '0')}`,
    createdAt: now,
    updatedAt: now
  };
  
  // In a real app, this would be persisted to the database
  mockTickets.push(newTicket);
  
  return newTicket;
};

export const updateTicket = async (id: string, updates: Partial<Ticket>): Promise<Ticket> => {
  // In a real implementation, this would call the API
  
  
  // Wait to simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const ticketIndex = mockTickets.findIndex(t => t.id === id);
  if (ticketIndex === -1) {
    throw new Error(`Ticket with ID ${id} not found`);
  }
  
  const updatedTicket: Ticket = {
    ...mockTickets[ticketIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  // In a real app, this would be persisted to the database
  mockTickets[ticketIndex] = updatedTicket;
  
  return updatedTicket;
};

export const fetchTicketComments = async (ticketId: string): Promise<TicketComment[]> => {
  // In a real implementation, this would call the API
  
  
  // Wait to simulate network delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  return mockComments.filter(comment => comment.ticketId === ticketId);
};

export const addTicketComment = async (comment: Omit<TicketComment, 'id' | 'createdAt'>): Promise<TicketComment> => {
  // In a real implementation, this would call the API
  
  
  // Wait to simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newComment: TicketComment = {
    ...comment,
    id: `comment-${uuidv4().substring(0, 8)}`,
    createdAt: new Date().toISOString()
  };
  
  // In a real app, this would be persisted to the database
  mockComments.push(newComment);
  
  return newComment;
};

export const assignTicket = async (ticketId: string, assigneeId: string, assigneeName: string): Promise<Ticket> => {
  // In a real implementation, this would call the API
  
  
  // Update the ticket
  const updatedTicket = await updateTicket(ticketId, { 
    assigneeId, 
    status: 'in_progress' 
  });
  
  // Add a comment about the assignment
  await addTicketComment({
    ticketId,
    content: `Ticket atribuído para ${assigneeName}`,
    authorId: 'system',
    authorName: 'Sistema',
    isInternal: true
  });
  
  return updatedTicket;
};

export const getAgentPerformance = async (agentId: string): Promise<{ 
  ticketsResolved: number;
  averageResponseTime: number;
  customerSatisfaction: number;
}> => {
  // In a real implementation, this would call the API
  
  
  // Wait to simulate network delay
  await new Promise(resolve => setTimeout(resolve, 700));
  
  // Return mock performance data
  return {
    ticketsResolved: 42,
    averageResponseTime: 3.5, // hours
    customerSatisfaction: 4.7 // out of 5
  };
};
