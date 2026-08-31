import React, { useEffect, useState, useRef } from "react";
import { X, Loader2, Send, ChevronDown } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useAgentTicketStore } from "../../store/agentTicketStore";
import StatusBadge from "../ui/StatusBadge";
import PriorityBadge from "../ui/PriorityBadge";
import { getHistoryLabel } from "../../utils/historyLabels";
import type { TicketPriority } from "../../types/ticket";
import toast from "react-hot-toast";

interface AgentTicketDetailModalProps {
  ticketId: string;
  onClose: () => void;
}

const PRIORITY_OPTIONS: TicketPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Isolated Composer (prevents re-rendering parent on type) ───
const MessageComposer = React.memo(function MessageComposer({
  ticketId,
}: {
  ticketId: string;
}) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const sendMessage = useAgentTicketStore((s) => s.sendMessage);

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
        placeholder="Type your reply..."
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

// ─── Isolated Priority Editor ───
const PriorityEditor = React.memo(function PriorityEditor({
  ticketId,
  current,
}: {
  ticketId: string;
  current: TicketPriority;
}) {
  const [open, setOpen] = useState(false);
  const updatePriority = useAgentTicketStore((s) => s.updatePriority);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleSelect = async (p: TicketPriority) => {
    if (p === current) return;
    await updatePriority(ticketId, p);
    toast.success(`Priority updated to ${p}`);
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
              className={`flex w-full items-center px-3 py-1.5 text-xs font-medium hover:bg-slate-50 ${
                p === current ? "bg-blue-50 text-blue-700" : "text-slate-700"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

// ─── Main Modal ───
export default React.memo(function AgentTicketDetailModal({
  ticketId,
  onClose,
}: AgentTicketDetailModalProps) {
  const user = useAuthStore((s) => s.user);
  const ticket = useAgentTicketStore((s) => s.selectedTicket);
  const messages = useAgentTicketStore((s) => s.messages);
  const history = useAgentTicketStore((s) => s.history);
  const loading = useAgentTicketStore((s) => s.loading);
  const fetchDetails = useAgentTicketStore((s) => s.fetchTicketDetails);
  const fetchMessages = useAgentTicketStore((s) => s.fetchMessages);
  const fetchHistory = useAgentTicketStore((s) => s.fetchHistory);
  const startTicket = useAgentTicketStore((s) => s.startTicket);
  const resolveTicket = useAgentTicketStore((s) => s.resolveTicket);
  const closeTicket = useAgentTicketStore((s) => s.closeTicket);
  const clearSelected = useAgentTicketStore((s) => s.clearSelected);

  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchDetails(ticketId);
    fetchMessages(ticketId);
    fetchHistory(ticketId);
  }, [ticketId, fetchDetails, fetchMessages, fetchHistory]);

  useEffect(() => {
    return () => clearSelected();
  }, [clearSelected]);

  const handleAction = async (
    action: () => Promise<void>,
    successMsg: string,
  ) => {
    setActionLoading(true);
    try {
      await action();
      toast.success(successMsg);
    } catch {
      // Error in store
    } finally {
      setActionLoading(false);
    }
  };

  const lifecycleAction = () => {
    if (!ticket) return null;
    switch (ticket.status) {
      case "ASSIGNED":
        return (
          <button
            onClick={() =>
              handleAction(() => startTicket(ticketId), "Ticket started")
            }
            disabled={actionLoading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {actionLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              "Start Ticket"
            )}
          </button>
        );
      case "IN_PROGRESS":
        return (
          <button
            onClick={() =>
              handleAction(() => resolveTicket(ticketId), "Ticket resolved")
            }
            disabled={actionLoading}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {actionLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              "Resolve Ticket"
            )}
          </button>
        );
      case "RESOLVED":
        return (
          <button
            onClick={() =>
              handleAction(() => closeTicket(ticketId), "Ticket closed")
            }
            disabled={actionLoading}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Close Ticket
          </button>
        );
      default:
        return null;
    }
  };

  const isAgentMessage = (role: string) => role === "agent" || role === "admin";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-slate-200 bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
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
                {ticket && <StatusBadge status={ticket.status} />}
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
            <div className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-3">
              {/* Main */}
              <div className="space-y-6 lg:col-span-2">
                {/* Description */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Description
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    {ticket?.description}
                  </p>
                </div>

                {/* Conversation */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-slate-900">
                    Conversation
                  </h3>
                  <div className="space-y-3">
                    {messages.length === 0 && (
                      <p className="text-sm text-slate-400">No messages yet.</p>
                    )}
                    {messages.map((msg) => {
                      const isAgent = isAgentMessage(msg.senderRole);
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isAgent ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm ${
                              isAgent
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 text-slate-900"
                            }`}
                          >
                            <p className="text-xs font-medium opacity-75 mb-0.5">
                              {isAgent ? "You" : msg.senderName}
                            </p>
                            <p>{msg.content}</p>
                            <p
                              className={`mt-1 text-[10px] ${
                                isAgent ? "text-blue-100" : "text-slate-400"
                              }`}
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
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-900">
                  Ticket Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs text-slate-500">Customer</p>
                    <p className="font-medium text-slate-900">
                      {ticket?.customerId ? "Customer" : "—"}
                    </p>
                  </div>
                  {ticket?.createdAt && (
                    <div>
                      <p className="text-xs text-slate-500">Created</p>
                      <p className="font-medium text-slate-900">
                        {formatDateTime(ticket.createdAt)}
                      </p>
                    </div>
                  )}
                  {ticket?.assignedAt && (
                    <div>
                      <p className="text-xs text-slate-500">Assigned</p>
                      <p className="font-medium text-slate-900">
                        {formatDateTime(ticket.assignedAt)}
                      </p>
                    </div>
                  )}
                  {ticket?.startedAt && (
                    <div>
                      <p className="text-xs text-slate-500">Started</p>
                      <p className="font-medium text-slate-900">
                        {formatDateTime(ticket.startedAt)}
                      </p>
                    </div>
                  )}
                  {ticket?.resolvedAt && (
                    <div>
                      <p className="text-xs text-slate-500">Resolved</p>
                      <p className="font-medium text-slate-900">
                        {formatDateTime(ticket.resolvedAt)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Activity */}
          {history.length > 0 && (
            <div className="border-t border-slate-100 p-5">
              <h3 className="mb-3 text-sm font-semibold text-slate-900">
                Activity
              </h3>
              <div className="space-y-3">
                {history.map((h) => (
                  <div key={h.id} className="flex gap-3">
                    <div className="relative flex flex-col items-center">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <div className="mt-1 h-full w-px bg-slate-200" />
                    </div>
                    <div className="pb-4">
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

        {/* Actions */}
        {ticket && lifecycleAction() && (
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 p-5">
            {lifecycleAction()}
          </div>
        )}
      </div>
    </div>
  );
});
