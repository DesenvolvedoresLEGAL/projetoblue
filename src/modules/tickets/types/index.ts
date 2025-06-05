
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

export interface TicketFilter {
  status?: string;
  priority?: string;
  category?: string;
  assigneeId?: string;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
}

export interface AgentPerformance {
  id: string;
  name: string;
  ticketsAssigned: number;
  ticketsResolved: number;
  resolutionRate: number;
  averageResponseTime: number;
  customerSatisfaction: number;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];
  views: number;
  helpfulCount: number;
  notHelpfulCount: number;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  authorName: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  conditions: RuleCondition[];
  actions: RuleAction[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastExecuted?: string;
  executionCount: number;
}

export interface RuleCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: string | number | boolean;
}

export interface RuleAction {
  type: 'assign' | 'update_status' | 'add_tag' | 'remove_tag' | 'send_notification';
  parameters: Record<string, any>;
}
