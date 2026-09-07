export interface AdminStats {
  totalTickets: number;
  waiting: number;
  assigned: number;
  inProgress: number;
  resolved: number;
  totalAgents: number;
  onlineAgents: number;
}

export interface AdminAgent {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  isOnline: boolean;
  activeTickets: number;
}
