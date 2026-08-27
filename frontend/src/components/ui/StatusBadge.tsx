import React from "react";
import type { TicketStatus } from "../../types/ticket";

const STATUS_STYLES: Record<TicketStatus, string> = {
  WAITING: "bg-amber-50 text-amber-700 border-amber-200",
  ASSIGNED: "bg-blue-50 text-blue-700 border-blue-200",
  IN_PROGRESS: "bg-indigo-50 text-indigo-700 border-indigo-200",
  RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CLOSED: "bg-slate-100 text-slate-600 border-slate-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_LABELS: Record<TicketStatus, string> = {
  WAITING: "Waiting for agent",
  ASSIGNED: "Agent assigned",
  IN_PROGRESS: "In progress",
  RESOLVED: "Issue resolved",
  CLOSED: "Closed",
  CANCELLED: "Cancelled",
};

interface StatusBadgeProps {
  status: TicketStatus;
}

const StatusBadge = React.memo(function StatusBadge({
  status,
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
});

export default StatusBadge;
