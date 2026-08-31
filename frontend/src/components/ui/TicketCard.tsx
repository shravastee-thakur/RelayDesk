import React from "react";
import { Clock, ArrowRight } from "lucide-react";
import type { Tickets } from "../../types/ticket";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";
import { CARD_STYLES } from "../../components/agent/priorityStyles";

interface TicketCardProps {
  ticket: Tickets;
  onClick?: () => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const TicketCard = React.memo(function TicketCard({
  ticket,
  onClick,
}: TicketCardProps) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-xl border border-l-4 p-5 shadow-sm transition-all hover:shadow-md ${CARD_STYLES[ticket.priority]}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-slate-900">
            #{ticket.id.slice(-4)} {ticket.title}
          </h3>
          <p className="mt-1 line-clamp-1 text-xs text-slate-500">
            {ticket.description}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <PriorityBadge priority={ticket.priority} />
          <StatusBadge status={ticket.status} />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <Clock size={12} />
          <span>{formatDate(ticket.createdAt)}</span>
        </div>
        <span className="flex items-center gap-1 text-xs font-medium text-blue-600">
          View Details <ArrowRight size={12} />
        </span>
      </div>
    </div>
  );
});

export default TicketCard;
