import React, { useEffect, useState, useRef } from "react";
import { X, Loader2, Send, ChevronDown } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useAdminStore } from "../../store/adminStore";
import StatusBadge from "../ui/StatusBadge";
import PriorityBadge from "../ui/PriorityBadge";
import { getHistoryLabel } from "../../utils/historyLabels";
import type { TicketPriority, TicketStatus } from "../../types/ticket";

interface AdminTicketDetailModalProps {
  ticketId: string;
  onClose: () => void;
}

const PRIORITY_OPTIONS: TicketPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const STATUS_OPTIONS: TicketStatus[] = [
  "WAITING",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
  "CANCELLED",
];

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Isolated Composer
const MessageComposer = React.memo(function MessageComposer({
  ticketId,
}: {
  ticketId: string;
}) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const sendMessage = useAdminStore((s) => s.sendMessage);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    await sendMessage(ticketId, text.trim());
    setSending(false);
    setText("");
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        placeholder="Type a message as admin..."
        className="flex-1 rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
      />
      <button
        onClick={handleSend}
        disabled={sending || !text.trim()}
        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {sending ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Send size={14} />
        )}
        Send
      </button>
    </div>
  );
});

// Isolated Priority Editor
const PriorityEditor = React.memo(function PriorityEditor({
  ticketId,
  current,
}: {
  ticketId: string;
  current: TicketPriority;
}) {
  const [open, setOpen] = useState(false);
  const updatePriority = useAdminStore((s) => s.updatePriority);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      )
        setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleSelect = async (p: TicketPriority) => {
    if (p === current) return;
    await updatePriority(ticketId, p);
    setOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold hover:bg-slate-50"
      >
        <PriorityBadge priority={current} />
        <ChevronDown size={12} className="text-slate-400" />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-10 mt-1 w-32 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          {PRIORITY_OPTIONS.map((p) => (
            <button
              key={p}
              onClick={() => handleSelect(p)}
              className={`flex w-full items-center px-3 py-1.5 text-xs font-medium hover:bg-slate-50 ${p === current ? "bg-blue-50 text-blue-700" : "text-slate-700"}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

// Isolated Status Editor
const StatusEditor = React.memo(function StatusEditor({
  ticketId,
  current,
}: {
  ticketId: string;
  current: TicketStatus;
}) {
  const [open, setOpen] = useState(false);
  const updateStatus = useAdminStore((s) => s.updateStatus);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      )
        setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleSelect = async (s: TicketStatus) => {
    if (s === current) return;
    await updateStatus(ticketId, s);
    setOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold hover:bg-slate-50"
      >
        <StatusBadge status={current} />
        <ChevronDown size={12} className="text-slate-400" />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-10 mt-1 w-40 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleSelect(s)}
              className={`flex w-full items-center px-3 py-1.5 text-xs font-medium hover:bg-slate-50 ${s === current ? "bg-blue-50 text-blue-700" : "text-slate-700"}`}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

// Main Modal
export default React.memo(function AdminTicketDetailModal({
  ticketId,
  onClose,
}: AdminTicketDetailModalProps) {
  const user = useAuthStore((s) => s.user);
  const ticket = useAdminStore((s) => s.selectedTicket);
  const messages = useAdminStore((s) => s.messages);
  const history = useAdminStore((s) => s.history);
  const loading = useAdminStore((s) => s.loading);

  const fetchDetails = useAdminStore((s) => s.fetchTicketDetails);
  const fetchMessages = useAdminStore((s) => s.fetchMessages);
  const fetchHistory = useAdminStore((s) => s.fetchHistory);
  const closeTicket = useAdminStore((s) => s.closeTicket);
  const clearSelected = useAdminStore((s) => s.clearSelected);

  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchDetails(ticketId);
    fetchMessages(ticketId);
    fetchHistory(ticketId);
  }, [ticketId, fetchDetails, fetchMessages, fetchHistory]);

  useEffect(() => {
    return () => clearSelected();
  }, [clearSelected]);

  const handleClose = async () => {
    setActionLoading(true);
    await closeTicket(ticketId);
    setActionLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-slate-200 bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-slate-400">
                  #{ticketId.slice(-4)}
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  {ticket?.title}
                </h2>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                {ticket && (
                  <StatusEditor ticketId={ticketId} current={ticket.status} />
                )}
                {ticket && (
                  <PriorityEditor
                    ticketId={ticketId}
                    current={ticket.priority}
                  />
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading && !ticket ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-0 lg:grid-cols-3">
              {/* Main Column */}
              <div className="space-y-6 p-5 lg:col-span-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Description
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    {ticket?.description}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                  <h3 className="mb-3 text-sm font-semibold text-slate-900">
                    Conversation
                  </h3>
                  <div className="space-y-3">
                    {messages.length === 0 && (
                      <p className="text-sm text-slate-400">No messages yet.</p>
                    )}
                    {messages.map((msg) => {
                      const isMe = msg.senderId === user?.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm ${isMe ? "bg-blue-600 text-white" : "bg-white text-slate-900 shadow-sm"}`}
                          >
                            <p className="mb-0.5 text-xs font-medium opacity-75">
                              {isMe ? "You (Admin)" : msg.senderName || "User"}
                            </p>
                            <p>{msg.message}</p>
                            <p
                              className={`mt-1 text-[10px] ${isMe ? "text-blue-100" : "text-slate-400"}`}
                            >
                              {formatDateTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4">
                    <MessageComposer ticketId={ticketId} />
                  </div>
                </div>

                {history.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-slate-900">
                      Activity
                    </h3>
                    <div className="space-y-0">
                      {history.map((h, idx) => (
                        <div key={h.id} className="flex gap-3">
                          <div className="relative flex flex-col items-center">
                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                            {idx !== history.length - 1 && (
                              <div className="mt-1 h-full w-px bg-slate-200" />
                            )}
                          </div>
                          <div className="pb-5">
                            <p className="text-sm font-medium text-slate-900">
                              {getHistoryLabel(h)}
                            </p>
                            <p className="text-xs text-slate-400">
                              {formatDateTime(h.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="border-t border-slate-100 bg-slate-50/50 p-5 lg:border-l lg:border-t-0">
                <h3 className="mb-4 text-sm font-semibold text-slate-900">
                  Ticket Information
                </h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Customer
                    </p>
                    {ticket?.customer?.name ? (
                      <div className="mt-0.5">
                        <p className="font-semibold text-slate-900">
                          {ticket.customer.name}
                        </p>
                      </div>
                    ) : (
                      <p className="mt-0.5 font-medium text-slate-900">
                        {ticket?.customerId ?? "—"}
                      </p>
                    )}
                  </div>

                  {ticket?.createdAt && (
                    <div>
                      <p className="text-xs font-medium text-slate-500">
                        Ticket Created
                      </p>
                      <p className="mt-0.5 font-medium text-slate-900">
                        {formatDateTime(ticket.createdAt)}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Assigned To
                    </p>
                    <p className="mt-0.5 font-medium text-slate-900">
                      {ticket?.agentId
                        ? (ticket as any).agentName || ticket.agentId
                        : "Unassigned"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Priority
                    </p>
                    <div className="mt-1">
                      {ticket && <PriorityBadge priority={ticket.priority} />}
                    </div>
                  </div>

                  {ticket?.startedAt && (
                    <div>
                      <p className="text-xs font-medium text-slate-500">
                        Started
                      </p>
                      <p className="mt-0.5 font-medium text-slate-900">
                        {formatDateTime(ticket.startedAt)}
                      </p>
                    </div>
                  )}

                  {ticket?.resolvedAt && (
                    <div>
                      <p className="text-xs font-medium text-slate-500">
                        Resolved
                      </p>
                      <p className="mt-0.5 font-medium text-slate-900">
                        {formatDateTime(ticket.resolvedAt)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Action */}
        {ticket && ticket.status === "RESOLVED" && (
          <div className="flex items-center justify-end border-t border-slate-100 px-5 py-4">
            <button
              onClick={handleClose}
              disabled={actionLoading}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              {actionLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Close Ticket"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
});
