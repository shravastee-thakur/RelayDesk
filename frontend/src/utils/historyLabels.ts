import type { TicketHistoryItem } from "../types/ticket";

export function getHistoryLabel(h: TicketHistoryItem): string {
  switch (h.action) {
    case "CREATED":
      return "Ticket created";
    case "ASSIGNED":
      return "Agent assigned";
    case "PRIORITY_CHANGED":
      return "Priority updated";
    case "MESSAGE":
      return "New message";
    case "STATUS_CHANGED": {
      switch (h.newStatus) {
        case "IN_PROGRESS":
          return "Agent started working";
        case "RESOLVED":
          return "Ticket resolved";
        case "CLOSED":
          return "Ticket closed";
        case "CANCELLED":
          return "Ticket cancelled";
        case "ASSIGNED":
          return "Ticket assigned to agent";
        case "WAITING":
          return "Waiting for an agent";
        default:
          return "Status updated";
      }
    }
    default:
      return h.action;
  }
}
