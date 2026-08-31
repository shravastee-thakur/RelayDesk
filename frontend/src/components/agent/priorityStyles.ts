import type { TicketPriority } from "../../types/ticket";

export const CARD_STYLES: Record<TicketPriority, string> = {
  URGENT:
    "bg-red-50/80 border-red-200 border-l-4 border-l-red-600 hover:border-red-300",
  HIGH: "bg-amber-50/80 border-amber-200 border-l-4 border-l-amber-500 hover:border-amber-300",
  MEDIUM:
    "bg-blue-50/80 border-blue-200 border-l-4 border-l-blue-500 hover:border-blue-300",
  LOW: "bg-slate-50/80 border-slate-200 border-l-4 border-l-slate-400 hover:border-slate-300",
};

export const ACCENT_TEXT: Record<TicketPriority, string> = {
  URGENT: "text-red-700",
  HIGH: "text-amber-700",
  MEDIUM: "text-blue-700",
  LOW: "text-slate-600",
};
