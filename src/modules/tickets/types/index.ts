
export interface Ticket {
  id: string;
  number: string;
  subject: string;
  description: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'new' | 'open' | 'pending' | 'hold' | 'solved' | 'closed';
  type: 'incident' | 'problem' | 'question' | 'task';
  channel: 'email' | 'chat' | 'phone' | 'whatsapp' | 'web' | 'api';
  requester: {
    id: string;
    name: string;
    email: string;
    company?: string;
  };
  assignee?: {
    id: string;
    name: string;
    email: string;
  };
  group?: {
    id: string;
    name: string;
  };
  tags: string[];
  customFields?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  solvedAt?: string;
  closedAt?: string;
  satisfactionRating?: {
    score: number;
    comment?: string;
  };
  slaPolicy?: {
    id: string;
    name: string;
    target: number;
    breach?: boolean;
  };
}

export interface TicketComment {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  authorType: 'agent' | 'end_user' | 'system';
  body: string;
  htmlBody?: string;
  public: boolean;
  attachments?: Attachment[];
  createdAt: string;
  via: {
    channel: string;
    source: Record<string, any>;
  };
}

export interface Attachment {
  id: string;
  fileName: string;
  contentUrl: string;
  contentType: string;
  size: number;
  inline: boolean;
  thumbnails?: {
    url: string;
    width: number;
    height: number;
  }[];
}

export interface TicketMetrics {
  totalTickets: number;
  openTickets: number;
  solvedTickets: number;
  pendingTickets: number;
  averageResolutionTime: number;
  satisfactionScore: number;
  slaBreaches: number;
  firstResponseTime: number;
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  signature?: string;
  timeZone: string;
  locale: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  agents: Agent[];
  default: boolean;
}

export interface SLAPolicy {
  id: string;
  title: string;
  description?: string;
  position: number;
  filter: {
    all: Array<{
      field: string;
      operator: string;
      value: string;
    }>;
  };
  policyMetrics: Array<{
    priority: string;
    metric: string;
    target: number;
    businessHours: boolean;
  }>;
  active: boolean;
}

export interface AutomationRule {
  id: string;
  title: string;
  position: number;
  active: boolean;
  conditions: {
    all: Array<{
      field: string;
      operator: string;
      value: string;
    }>;
  };
  actions: Array<{
    field: string;
    value: string;
  }>;
  categoryId?: string;
}

export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  body: string;
  htmlUrl: string;
  authorId: string;
  sectionId: string;
  position: number;
  promoted: boolean;
  featured: boolean;
  outdated: boolean;
  draft: boolean;
  commentsDisabled: boolean;
  labelNames: string[];
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
  voteSum: number;
  voteCount: number;
}

export interface TicketFilters {
  status?: string[];
  priority?: string[];
  type?: string[];
  assignee?: string[];
  group?: string[];
  tags?: string[];
  requester?: string;
  subject?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface TicketSort {
  field: 'created_at' | 'updated_at' | 'priority' | 'status' | 'assignee';
  direction: 'asc' | 'desc';
}
