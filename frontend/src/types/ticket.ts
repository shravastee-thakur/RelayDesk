export type TicketStatus =
  | "WAITING"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED"
  | "CANCELLED";

export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface Tickets {
  id: string;
  customerId: string;
  agentId: string | null;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
  assignedAt: string | null;
  startedAt: string | null;
  resolvedAt: string | null;
}

export interface TicketHistoryItem {
  id: string;
  ticketId: string;
  changedBy: string;
  action:
    | "CREATED"
    | "ASSIGNED"
    | "STATUS_CHANGED"
    | "PRIORITY_CHANGED"
    | "MESSAGE";
  oldStatus?: TicketStatus;
  newStatus?: TicketStatus;
  oldPriority?: TicketPriority;
  newPriority?: TicketPriority;
  createdAt: string;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  createdAt: string;
}
