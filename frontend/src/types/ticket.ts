export type TicketStatus =
  | "open"
  | "assigned"
  | "in_progress"
  | "resolved"
  | "closed"
  | "waiting";

export type TicketPriority = "urgent" | "high" | "medium" | "low";

export interface TicketUser {
  id: string;
  name: string;
}

export interface Ticket {
  id: string;
  title: string;
  status: TicketStatus;
  priority: TicketPriority;
  customer: TicketUser;
  agent?: TicketUser;
  createdAt: string;
  updatedAt?: string;
}
