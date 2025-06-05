
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ticketService } from "../services/ticketService";
import { TicketFilters, Ticket, TicketComment } from "../types";

export const useTickets = (filters?: TicketFilters) => {
  const queryClient = useQueryClient();
  
  // Fetch tickets with optional filters
  const ticketsQuery = useQuery({
    queryKey: ["tickets", filters],
    queryFn: () => ticketService.fetchTickets(filters),
  });
  
  // Fetch a single ticket by ID
  const useTicketDetails = (ticketId: string) => {
    return useQuery({
      queryKey: ["ticket", ticketId],
      queryFn: () => ticketService.fetchTicket(ticketId),
      enabled: !!ticketId,
    });
  };
  
  // Fetch comments for a ticket
  const useTicketComments = (ticketId: string) => {
    return useQuery({
      queryKey: ["ticket-comments", ticketId],
      queryFn: () => ticketService.fetchTicketComments(ticketId),
      enabled: !!ticketId,
    });
  };
  
  // Create a new ticket
  const createTicketMutation = useMutation({
    mutationFn: (newTicket: Partial<Ticket>) => ticketService.createTicket(newTicket),
    onSuccess: () => {
      // Invalidate and refetch tickets
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
  
  // Update an existing ticket
  const updateTicketMutation = useMutation({
    mutationFn: ({ ticketId, data }: { ticketId: string; data: Partial<Ticket> }) => 
      ticketService.updateTicket(ticketId, data),
    onSuccess: (updatedTicket) => {
      // Update the ticket in the cache
      queryClient.invalidateQueries({ queryKey: ["ticket", updatedTicket.id] });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
  
  // Add a comment to a ticket
  const addCommentMutation = useMutation({
    mutationFn: (newComment: Partial<TicketComment>) => 
      ticketService.addTicketComment(newComment),
    onSuccess: (comment) => {
      // Invalidate comments for this ticket
      queryClient.invalidateQueries({ queryKey: ["ticket-comments", comment.ticketId] });
      // Also invalidate the ticket itself to update "updated_at"
      queryClient.invalidateQueries({ queryKey: ["ticket", comment.ticketId] });
    },
  });
  
  // Fetch ticket metrics
  const ticketMetricsQuery = useQuery({
    queryKey: ["ticket-metrics"],
    queryFn: () => ticketService.getTicketMetrics(),
  });
  
  return {
    tickets: ticketsQuery.data || [],
    ticketsLoading: ticketsQuery.isLoading,
    ticketsError: ticketsQuery.error,
    ticketMetrics: ticketMetricsQuery.data,
    metricLoading: ticketMetricsQuery.isLoading,
    createTicket: createTicketMutation.mutate,
    updateTicket: updateTicketMutation.mutate,
    addComment: addCommentMutation.mutate,
    useTicketDetails,
    useTicketComments,
  };
};
