
import { Ticket, TicketComment, TicketFilters, Agent, Group } from "../types";

export const ticketService = {
  // Fetch tickets with filters - using mock data for now
  async fetchTickets(filters?: TicketFilters): Promise<Ticket[]> {
    try {
      // Mock data - replace with actual Supabase calls once tables are created
      const mockTickets: Ticket[] = [
        {
          id: "TK-2024-001",
          number: "TK-2024-001",
          subject: "Problema de conectividade com roteador",
          description: "Cliente reporta intermitência na conexão WiFi",
          priority: "high",
          status: "open",
          type: "incident",
          channel: "email",
          requester: {
            id: "1",
            name: "João Silva",
            email: "joao@empresa.com",
            company: "Empresa ABC"
          },
          assignee: {
            id: "agent1",
            name: "Maria Santos",
            email: "maria@suporte.com"
          },
          group: {
            id: "tech",
            name: "Suporte Técnico"
          },
          tags: ["conectividade", "wifi"],
          createdAt: "2024-01-15T10:30:00Z",
          updatedAt: "2024-01-15T14:22:00Z"
        },
        {
          id: "TK-2024-002",
          number: "TK-2024-002",
          subject: "Solicitação de novo chip para filial",
          description: "Necessário chip adicional para nova filial",
          priority: "normal",
          status: "pending",
          type: "task",
          channel: "chat",
          requester: {
            id: "2",
            name: "Ana Costa",
            email: "ana@empresa2.com",
            company: "Empresa XYZ"
          },
          assignee: {
            id: "agent2",
            name: "Pedro Lima",
            email: "pedro@suporte.com"
          },
          tags: ["chip", "filial"],
          createdAt: "2024-01-15T09:15:00Z",
          updatedAt: "2024-01-15T11:45:00Z"
        }
      ];

      // Apply basic filters if provided
      let filteredTickets = mockTickets;
      
      if (filters) {
        if (filters.status && filters.status.length > 0) {
          filteredTickets = filteredTickets.filter(ticket => 
            filters.status!.includes(ticket.status)
          );
        }
        if (filters.priority && filters.priority.length > 0) {
          filteredTickets = filteredTickets.filter(ticket => 
            filters.priority!.includes(ticket.priority)
          );
        }
        if (filters.subject) {
          filteredTickets = filteredTickets.filter(ticket => 
            ticket.subject.toLowerCase().includes(filters.subject!.toLowerCase())
          );
        }
      }
      
      return filteredTickets;
    } catch (error) {
      console.error("Error in ticketService.fetchTickets:", error);
      throw error;
    }
  },
  
  // Fetch a single ticket by ID
  async fetchTicket(ticketId: string): Promise<Ticket> {
    try {
      const tickets = await this.fetchTickets();
      const ticket = tickets.find(t => t.id === ticketId);
      
      if (!ticket) {
        throw new Error(`Ticket ${ticketId} not found`);
      }
      
      return ticket;
    } catch (error) {
      console.error("Error in ticketService.fetchTicket:", error);
      throw error;
    }
  },
  
  // Create a new ticket
  async createTicket(ticketData: Partial<Ticket>): Promise<Ticket> {
    try {
      // Generate ticket number
      const ticketNumber = await this.generateTicketNumber();
      
      const newTicket: Ticket = {
        id: `TK-${Date.now()}`,
        number: ticketNumber,
        subject: ticketData.subject || "",
        description: ticketData.description || "",
        priority: ticketData.priority || "normal",
        status: ticketData.status || "new",
        type: ticketData.type || "question",
        channel: ticketData.channel || "web",
        requester: ticketData.requester || {
          id: "unknown",
          name: "Unknown User",
          email: "unknown@example.com"
        },
        tags: ticketData.tags || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log("Mock ticket created:", newTicket);
      return newTicket;
    } catch (error) {
      console.error("Error in ticketService.createTicket:", error);
      throw error;
    }
  },
  
  // Update an existing ticket
  async updateTicket(ticketId: string, ticketData: Partial<Ticket>): Promise<Ticket> {
    try {
      const ticket = await this.fetchTicket(ticketId);
      
      const updatedTicket = {
        ...ticket,
        ...ticketData,
        updatedAt: new Date().toISOString()
      };
      
      console.log("Mock ticket updated:", updatedTicket);
      return updatedTicket;
    } catch (error) {
      console.error("Error in ticketService.updateTicket:", error);
      throw error;
    }
  },
  
  // Get ticket comments
  async fetchTicketComments(ticketId: string): Promise<TicketComment[]> {
    try {
      // Mock comments data
      const mockComments: TicketComment[] = [
        {
          id: "comment-1",
          ticketId: ticketId,
          authorId: "agent1",
          authorName: "Maria Santos",
          authorType: "agent",
          body: "Obrigada pelo contato. Vou verificar a configuração do seu roteador.",
          public: true,
          createdAt: "2024-01-15T10:45:00Z",
          via: {
            channel: "email",
            source: {}
          }
        },
        {
          id: "comment-2",
          ticketId: ticketId,
          authorId: "customer1",
          authorName: "João Silva",
          authorType: "end_user",
          body: "Muito obrigado pela resposta rápida!",
          public: true,
          createdAt: "2024-01-15T14:20:00Z",
          via: {
            channel: "email",
            source: {}
          }
        }
      ];
      
      return mockComments;
    } catch (error) {
      console.error("Error in ticketService.fetchTicketComments:", error);
      throw error;
    }
  },
  
  // Add a comment to a ticket
  async addTicketComment(comment: Partial<TicketComment>): Promise<TicketComment> {
    try {
      const newComment: TicketComment = {
        id: `comment-${Date.now()}`,
        ticketId: comment.ticketId || "",
        authorId: comment.authorId || "system",
        authorName: comment.authorName || "System",
        authorType: comment.authorType || "system",
        body: comment.body || "",
        public: comment.public !== false,
        createdAt: new Date().toISOString(),
        via: comment.via || {
          channel: "web",
          source: {}
        }
      };
      
      console.log("Mock comment added:", newComment);
      return newComment;
    } catch (error) {
      console.error("Error in ticketService.addTicketComment:", error);
      throw error;
    }
  },
  
  // Fetch agents
  async fetchAgents(): Promise<Agent[]> {
    try {
      // Mock agents data using existing user roles
      const mockAgents: Agent[] = [
        {
          id: "agent1",
          name: "Maria Santos",
          email: "maria@suporte.com",
          role: "gestor",
          active: true,
          timeZone: "America/Sao_Paulo",
          locale: "pt-BR"
        },
        {
          id: "agent2",
          name: "Pedro Lima",
          email: "pedro@suporte.com",
          role: "consultor",
          active: true,
          timeZone: "America/Sao_Paulo",
          locale: "pt-BR"
        },
        {
          id: "agent3",
          name: "Lucia Fernandes",
          email: "lucia@suporte.com",
          role: "consultor",
          active: true,
          timeZone: "America/Sao_Paulo",
          locale: "pt-BR"
        }
      ];
      
      return mockAgents;
    } catch (error) {
      console.error("Error in ticketService.fetchAgents:", error);
      throw error;
    }
  },
  
  // Fetch groups
  async fetchGroups(): Promise<Group[]> {
    try {
      // Mock groups data
      const mockGroups: Group[] = [
        {
          id: "tech",
          name: "Suporte Técnico",
          description: "Grupo responsável por questões técnicas",
          agents: [],
          default: false
        },
        {
          id: "billing",
          name: "Financeiro",
          description: "Grupo responsável por questões de cobrança",
          agents: [],
          default: false
        },
        {
          id: "general",
          name: "Atendimento Geral",
          description: "Grupo de atendimento geral",
          agents: [],
          default: true
        }
      ];
      
      return mockGroups;
    } catch (error) {
      console.error("Error in ticketService.fetchGroups:", error);
      throw error;
    }
  },
  
  // Get ticket metrics
  async getTicketMetrics() {
    try {
      // Mock metrics data
      return {
        totalTickets: 1247,
        openTickets: 156,
        solvedTickets: 976,
        pendingTickets: 23,
        averageResolutionTime: 8100, // in seconds
        satisfactionScore: 4.7,
        slaBreaches: 12,
        firstResponseTime: 2700 // in seconds
      };
    } catch (error) {
      console.error("Error in ticketService.getTicketMetrics:", error);
      throw error;
    }
  },
  
  // Generate a ticket number
  async generateTicketNumber(): Promise<string> {
    // Simple format: TK-YYYY-XXXX
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000); // 4-digit number
    return `TK-${year}-${random}`;
  }
};
