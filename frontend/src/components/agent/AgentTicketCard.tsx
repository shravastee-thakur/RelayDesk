import React from "react";
import { Clock, ArrowRight } from "lucide-react";
import type { Tickets } from "../../types/ticket";
import PriorityBadge from "../ui/PriorityBadge";
import StatusBadge from "../ui/StatusBadge";
import { CARD_STYLES } from "../../components/agent/priorityStyles";



interface AgentTicketCardProps {
  ticket: Tickets;
  onClick?: () => void;
  meta?: string; // e.g. "Waiting 4 min" or "Assigned 12 min ago"
}

const AgentTicketCard = React.memo(function AgentTicketCard({
  ticket,
  onClick,
  meta,
}: AgentTicketCardProps) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-xl border border-l-4 p-5 shadow-sm transition-all hover:shadow-md ${CARD_STYLES[ticket.priority]}`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-slate-400">
            #{ticket.id.slice(-4)}
          </span>
          <h3 className="truncate text-sm font-semibold text-slate-900">
            {ticket.title}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <PriorityBadge priority={ticket.priority} />
          <StatusBadge status={ticket.status} />
        </div>

        <div className="flex items-center justify-between">
          {meta && (
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Clock size={12} />
              <span>{meta}</span>
            </div>
          )}
          <span className="ml-auto flex items-center gap-1 text-xs font-medium text-blue-600">
            View Ticket <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </div>
  );
});

export default AgentTicketCard;
