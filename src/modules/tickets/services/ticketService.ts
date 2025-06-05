
import { supabase } from "@/integrations/supabase/client";
import { Ticket, TicketComment, TicketFilters, Agent, Group } from "../types";

export const ticketService = {
  // Fetch tickets with filters
  async fetchTickets(filters?: TicketFilters): Promise<Ticket[]> {
    try {
      let query = supabase
        .from("tickets")
        .select(`
          *,
          requester:profiles!requester_id(*),
          assignee:profiles!assignee_id(*)
        `);
      
      // Apply filters if provided
      if (filters) {
        if (filters.status && filters.status.length > 0) {
          query = query.in('status', filters.status);
        }
        if (filters.priority && filters.priority.length > 0) {
          query = query.in('priority', filters.priority);
        }
        if (filters.type && filters.type.length > 0) {
          query = query.in('type', filters.type);
        }
        if (filters.assignee && filters.assignee.length > 0) {
          query = query.in('assignee_id', filters.assignee);
        }
        if (filters.group && filters.group.length > 0) {
          query = query.in('group_id', filters.group);
        }
        if (filters.subject) {
          query = query.ilike('subject', `%${filters.subject}%`);
        }
        if (filters.requester) {
          query = query.eq('requester_id', filters.requester);
        }
        if (filters.dateRange) {
          query = query
            .gte('created_at', filters.dateRange.start)
            .lte('created_at', filters.dateRange.end);
        }
      }
      
      // Order by created_at by default
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching tickets:", error);
        throw error;
      }
      
      return data as unknown as Ticket[];
    } catch (error) {
      console.error("Error in ticketService.fetchTickets:", error);
      throw error;
    }
  },
  
  // Fetch a single ticket by ID
  async fetchTicket(ticketId: string): Promise<Ticket> {
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select(`
          *,
          requester:profiles!requester_id(*),
          assignee:profiles!assignee_id(*)
        `)
        .eq("id", ticketId)
        .single();
      
      if (error) {
        console.error("Error fetching ticket:", error);
        throw error;
      }
      
      return data as unknown as Ticket;
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
      
      const { data, error } = await supabase
        .from("tickets")
        .insert({
          ...ticketData,
          number: ticketNumber,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error creating ticket:", error);
        throw error;
      }
      
      return data as unknown as Ticket;
    } catch (error) {
      console.error("Error in ticketService.createTicket:", error);
      throw error;
    }
  },
  
  // Update an existing ticket
  async updateTicket(ticketId: string, ticketData: Partial<Ticket>): Promise<Ticket> {
    try {
      const { data, error } = await supabase
        .from("tickets")
        .update({
          ...ticketData,
          updated_at: new Date().toISOString()
        })
        .eq("id", ticketId)
        .select()
        .single();
      
      if (error) {
        console.error("Error updating ticket:", error);
        throw error;
      }
      
      return data as unknown as Ticket;
    } catch (error) {
      console.error("Error in ticketService.updateTicket:", error);
      throw error;
    }
  },
  
  // Get ticket comments
  async fetchTicketComments(ticketId: string): Promise<TicketComment[]> {
    try {
      const { data, error } = await supabase
        .from("ticket_comments")
        .select("*")
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true });
      
      if (error) {
        console.error("Error fetching ticket comments:", error);
        throw error;
      }
      
      return data as unknown as TicketComment[];
    } catch (error) {
      console.error("Error in ticketService.fetchTicketComments:", error);
      throw error;
    }
  },
  
  // Add a comment to a ticket
  async addTicketComment(comment: Partial<TicketComment>): Promise<TicketComment> {
    try {
      const { data, error } = await supabase
        .from("ticket_comments")
        .insert({
          ...comment,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error adding ticket comment:", error);
        throw error;
      }
      
      // Also update the ticket's updated_at field
      if (comment.ticketId) {
        await this.updateTicket(comment.ticketId, { 
          updated_at: new Date().toISOString() 
        });
      }
      
      return data as unknown as TicketComment;
    } catch (error) {
      console.error("Error in ticketService.addTicketComment:", error);
      throw error;
    }
  },
  
  // Fetch agents
  async fetchAgents(): Promise<Agent[]> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "agent");
      
      if (error) {
        console.error("Error fetching agents:", error);
        throw error;
      }
      
      return data as unknown as Agent[];
    } catch (error) {
      console.error("Error in ticketService.fetchAgents:", error);
      throw error;
    }
  },
  
  // Fetch groups
  async fetchGroups(): Promise<Group[]> {
    try {
      const { data, error } = await supabase
        .from("ticket_groups")
        .select("*");
      
      if (error) {
        console.error("Error fetching groups:", error);
        throw error;
      }
      
      return data as unknown as Group[];
    } catch (error) {
      console.error("Error in ticketService.fetchGroups:", error);
      throw error;
    }
  },
  
  // Get ticket metrics
  async getTicketMetrics() {
    try {
      // In a real implementation, this would make a call to a backend endpoint
      // For now, we'll return mock data
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
    // In a real implementation, this would likely be handled by the server
    // For now, we'll create a simple format: TK-YYYY-XXXX
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000); // 4-digit number
    return `TK-${year}-${random}`;
  }
};
