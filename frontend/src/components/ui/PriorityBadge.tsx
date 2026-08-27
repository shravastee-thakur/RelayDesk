import React from "react";
import { AlertCircle, ArrowUp, ArrowDown, Minus } from "lucide-react";
import type { TicketPriority } from "../../types/ticket";

const PRIORITY_STYLES: Record<TicketPriority, string> = {
  URGENT: "bg-red-50 text-red-700 border-red-200",
  HIGH: "bg-orange-50 text-orange-700 border-orange-200",
  MEDIUM: "bg-blue-50 text-blue-700 border-blue-200",
  LOW: "bg-slate-100 text-slate-600 border-slate-200",
};

const PRIORITY_ICONS: Record<TicketPriority, React.ReactNode> = {
  URGENT: <AlertCircle size={12} />,
  HIGH: <ArrowUp size={12} />,
  MEDIUM: <Minus size={12} />,
  LOW: <ArrowDown size={12} />,
};

interface PriorityBadgeProps {
  priority: TicketPriority;
}

const PriorityBadge = React.memo(function PriorityBadge({
  priority,
}: PriorityBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${PRIORITY_STYLES[priority]}`}
    >
      {PRIORITY_ICONS[priority]}
      <span className="capitalize">{priority}</span>
    </span>
  );
});

export default PriorityBadge;
