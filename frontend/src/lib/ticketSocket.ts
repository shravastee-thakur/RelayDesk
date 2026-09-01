import { getSocket } from "./socket";
import { useAgentTicketStore } from "../store/agentTicketStore";
import type { TicketMessage, TicketStatus } from "../types/ticket";

let isSetup = false;

export const setupTicketSocketListeners = () => {
  const s = getSocket();
  if (!s || isSetup) return;
  isSetup = true;

  // ── Step 1: Real-time messages ──
  s.on("new_message", (msg: TicketMessage) => {
    const state = useAgentTicketStore.getState();

    // Only update if this modal is open for this ticket
    if (state.selectedTicket?.id !== msg.ticketId) return;
    // Deduplicate in case fetchMessages and socket race
    if (state.messages.find((m) => m.id === msg.id)) return;

    useAgentTicketStore.setState({
      messages: [...state.messages, msg],
    });
  });

  // ── Step 2: Status updates ──
  s.on(
    "ticket_status_updated",
    (data: { ticketId: string; status: TicketStatus; ticket?: any }) => {
      const state = useAgentTicketStore.getState();
      const patch: Partial<typeof state> = {};

      if (state.activeTickets.some((t) => t.id === data.ticketId)) {
        patch.activeTickets = state.activeTickets.map((t) =>
          t.id === data.ticketId
            ? { ...t, status: data.status, ...(data.ticket || {}) }
            : t,
        );
      }

      if (state.queue.some((t) => t.id === data.ticketId)) {
        patch.queue = state.queue.map((t) =>
          t.id === data.ticketId
            ? { ...t, status: data.status, ...(data.ticket || {}) }
            : t,
        );
      }

      if (state.selectedTicket?.id === data.ticketId) {
        patch.selectedTicket = {
          ...state.selectedTicket,
          status: data.status,
          ...(data.ticket || {}),
        };
      }

      if (Object.keys(patch).length) {
        useAgentTicketStore.setState(patch);
      }
    },
  );

  // ── Step 3: Assignment updates ──
  s.on(
    "ticket_assigned",
    (data: { ticketId: string; agentId: string; ticket?: any }) => {
      const state = useAgentTicketStore.getState();

      // Remove from queue immediately
      if (state.queue.some((t) => t.id === data.ticketId)) {
        useAgentTicketStore.setState({
          queue: state.queue.filter((t) => t.id !== data.ticketId),
        });
      }

      // If another agent claimed this ticket while we have it open, update the modal
      if (state.selectedTicket?.id === data.ticketId && data.ticket) {
        useAgentTicketStore.setState({
          selectedTicket: { ...state.selectedTicket, ...data.ticket },
        });
      }

      // Refresh active list so it appears if it was assigned to us
      if (state.activeTickets.length > 0) {
        state.fetchActiveTickets();
      }
    },
  );
};

export const teardownTicketSocketListeners = () => {
  const s = getSocket();
  if (!s) return;
  s.off("new_message");
  s.off("ticket_status_updated");
  s.off("ticket_assigned");
  isSetup = false;
};
