import { create } from "zustand";
import api from "../utils/api";
import {
  connectSocket,
  disconnectSocket as disconnectSocketIO,
  getSocket,
} from "../lib/socket";
import type {
  Tickets,
  TicketMessage,
  TicketPriority,
  TicketHistoryItem,
} from "../types/ticket";
import toast from "react-hot-toast";

interface AgentTicketState {
  activeTickets: Tickets[];
  queue: Tickets[];
  historyTickets: Tickets[];
  loading: boolean;
  error: string | null;

  selectedTicket: Tickets | null;
  messages: TicketMessage[];
  history: TicketHistoryItem[];

  fetchActiveTickets: () => Promise<void>;
  fetchQueue: () => Promise<void>;
  fetchAgentHistory: () => Promise<void>;
  takeNextTicket: () => Promise<Tickets>;
  startTicket: (id: string) => Promise<void>;
  resolveTicket: (id: string) => Promise<void>;

  fetchTicketDetails: (id: string) => Promise<void>;
  fetchMessages: (id: string) => Promise<void>;
  fetchHistory: (id: string) => Promise<void>;
  closeTicket: (id: string) => Promise<void>;
  updatePriority: (id: string, priority: TicketPriority) => Promise<void>;
  sendMessage: (ticketId: string, content: string) => Promise<void>;
  clearSelected: () => void;

  initSocket: (token: string, userId: string) => void;
  disconnectSocket: () => void;
}

const priorityOrder: Record<string, number> = {
  URGENT: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

export const useAgentTicketStore = create<AgentTicketState>((set, get) => ({
  activeTickets: [],
  queue: [],
  historyTickets: [],
  loading: false,
  error: null,

  selectedTicket: null,
  messages: [],
  history: [],

  fetchActiveTickets: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/api/tickets/agent/active");
      set({ activeTickets: res.data.data, loading: false });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to load active tickets";

      toast.error(errorMessage, {
        style: {
          borderRadius: "10px",
          background: "#25671E",
          color: "#fff",
        },
      });

      set({ error: errorMessage, loading: false });
    }
  },

  fetchQueue: async () => {
    if (get().queue.length > 0 && !get().error) return;

    set({ loading: true, error: null });
    try {
      const res = await api.get("/api/tickets/queue");
      set({ queue: res.data.data, loading: false });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to load queue";

      toast.error(errorMessage, {
        style: {
          borderRadius: "10px",
          background: "#25671E",
          color: "#fff",
        },
      });

      set({ error: errorMessage, loading: false });
    }
  },

  fetchAgentHistory: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/api/tickets/agent/history");
      set({ historyTickets: res.data.data, loading: false });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to load history";

      toast.error(errorMessage, {
        style: {
          borderRadius: "10px",
          background: "#25671E",
          color: "#fff",
        },
      });

      set({ error: errorMessage, loading: false });
    }
  },

  takeNextTicket: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.post("/api/tickets/assign-next");
      const ticket: Tickets = res.data.data;
      set({
        activeTickets: [...get().activeTickets, ticket],
        queue: get().queue.filter((t) => t.id !== ticket.id),
        loading: false,
      });
      return ticket;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to take ticket";

      toast.error(errorMessage, {
        style: {
          borderRadius: "10px",
          background: "#25671E",
          color: "#fff",
        },
      });

      set({ error: errorMessage, loading: false });
      throw err;
    }
  },

  startTicket: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const res = await api.patch(`/api/tickets/${id}/start`);
      set({
        activeTickets: get().activeTickets.map((t) =>
          t.id === id ? res.data.data : t,
        ),
        selectedTicket:
          get().selectedTicket?.id === id
            ? res.data.data
            : get().selectedTicket,
        loading: false,
      });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to start ticket";

      toast.error(errorMessage, {
        style: {
          borderRadius: "10px",
          background: "#25671E",
          color: "#fff",
        },
      });

      set({ error: errorMessage, loading: false });
    }
  },

  resolveTicket: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const res = await api.patch(`/api/tickets/${id}/resolve`);
      set({
        activeTickets: get().activeTickets.map((t) =>
          t.id === id ? res.data.data : t,
        ),
        selectedTicket:
          get().selectedTicket?.id === id
            ? res.data.data
            : get().selectedTicket,
        loading: false,
      });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to resolve ticket";

      toast.error(errorMessage, {
        style: {
          borderRadius: "10px",
          background: "#25671E",
          color: "#fff",
        },
      });

      set({ error: errorMessage, loading: false });
    }
  },

  fetchTicketDetails: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/api/tickets/${id}`);
      const ticket = res.data.data;
      set({ selectedTicket: ticket, loading: false });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to load ticket";

      toast.error(errorMessage, {
        style: {
          borderRadius: "10px",
          background: "#25671E",
          color: "#fff",
        },
      });

      set({ error: errorMessage, loading: false });
    }
  },

  fetchMessages: async (id: string) => {
    try {
      const res = await api.get(`/api/tickets/${id}/messages`);
      set({ messages: res.data.data });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to load messages";

      toast.error(errorMessage, {
        style: {
          borderRadius: "10px",
          background: "#25671E",
          color: "#fff",
        },
      });

      set({ error: errorMessage, loading: false });
    }
  },

  fetchHistory: async (id: string) => {
    try {
      const res = await api.get(`/api/tickets/${id}/history`);
      set({ history: res.data.data });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to load history";

      toast.error(errorMessage, {
        style: {
          borderRadius: "10px",
          background: "#25671E",
          color: "#fff",
        },
      });

      set({ error: errorMessage, loading: false });
    }
  },

  closeTicket: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const res = await api.patch(`/api/tickets/${id}/close`);
      set({
        selectedTicket:
          get().selectedTicket?.id === id
            ? res.data.data
            : get().selectedTicket,
        activeTickets: get().activeTickets.map((t) =>
          t.id === id ? res.data.data : t,
        ),
        loading: false,
      });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to close ticket";

      toast.error(errorMessage, {
        style: {
          borderRadius: "10px",
          background: "#25671E",
          color: "#fff",
        },
      });

      set({ error: errorMessage, loading: false });
    }
  },

  updatePriority: async (id: string, priority: TicketPriority) => {
    try {
      const res = await api.patch(`/api/tickets/${id}/priority`, { priority });
      set({
        selectedTicket:
          get().selectedTicket?.id === id
            ? res.data.data
            : get().selectedTicket,
        activeTickets: get().activeTickets.map((t) =>
          t.id === id ? res.data.data : t,
        ),
      });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to update priority";

      toast.error(errorMessage, {
        style: {
          borderRadius: "10px",
          background: "#25671E",
          color: "#fff",
        },
      });

      set({ error: errorMessage, loading: false });
    }
  },

  sendMessage: async (ticketId: string, content: string) => {
    try {
      await api.post(`/api/tickets/${ticketId}/messages`, { message: content });
      get().fetchMessages(ticketId);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to send message";

      toast.error(errorMessage, {
        style: {
          borderRadius: "10px",
          background: "#25671E",
          color: "#fff",
        },
      });

      set({ error: errorMessage, loading: false });
    }
  },

  clearSelected: () => {
    set({ selectedTicket: null, messages: [], history: [], error: null });
  },

  initSocket: (token: string, userId: string) => {
    const socket = connectSocket(token);
    if (!socket) return;

    if ((socket as any)._agentListeners) return;
    (socket as any)._agentListeners = true;

    socket.on("ticket_created", (ticket: Tickets) => {
      set((state) => {
        if (state.queue.find((t) => t.id === ticket.id)) return state;
        const newQueue = [...state.queue, ticket].sort((a, b) => {
          const pa = priorityOrder[a.priority] ?? 2;
          const pb = priorityOrder[b.priority] ?? 2;
          if (pa !== pb) return pa - pb;
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });
        return { queue: newQueue };
      });
    });

    socket.on("ticket_assigned", (ticket: Tickets) => {
      set((state) => {
        const next: Partial<AgentTicketState> = {
          queue: state.queue.filter((t) => t.id !== ticket.id),
        };
        if (
          ticket.agentId === userId &&
          !state.activeTickets.find((t) => t.id === ticket.id)
        ) {
          next.activeTickets = [...state.activeTickets, ticket];
        }
        return next;
      });
    });

    socket.on("ticket_status_updated", (ticket: Tickets) => {
      set((state) => {
        const next: Partial<AgentTicketState> = {};
        if (state.activeTickets.some((t) => t.id === ticket.id)) {
          next.activeTickets = state.activeTickets.map((t) =>
            t.id === ticket.id ? ticket : t,
          );
        }
        if (state.selectedTicket?.id === ticket.id) {
          next.selectedTicket = ticket;
        }
        if (ticket.status !== "WAITING") {
          next.queue = state.queue.filter((t) => t.id !== ticket.id);
        }
        return next;
      });
    });
  },

  disconnectSocket: () => {
    const socket = getSocket();
    if (socket) {
      socket.off("ticket_created");
      socket.off("ticket_assigned");
      socket.off("ticket_status_updated");
      (socket as any)._agentListeners = false;
    }
    disconnectSocketIO();
  },
}));
