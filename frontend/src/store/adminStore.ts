import { create } from "zustand";
import api from "../utils/api";
import {
  connectSocket,
  getSocket,
  joinTicketRoom,
  leaveTicketRoom,
} from "../lib/socket";
import type {
  Tickets,
  TicketMessage,
  TicketHistoryItem,
} from "../types/ticket";
import type { AdminStats, AdminAgent } from "../types/admin";
import toast from "react-hot-toast";

interface AdminState {
  stats: AdminStats | null;
  tickets: Tickets[];
  agents: AdminAgent[];
  selectedTicket: Tickets | null;
  messages: TicketMessage[];
  history: TicketHistoryItem[];
  loading: boolean;
  error: string | null;

  fetchStats: () => Promise<void>;
  fetchTickets: () => Promise<void>;
  fetchAgents: () => Promise<void>;
  createAgent: (data: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;

  fetchTicketDetails: (id: string) => Promise<void>;
  fetchMessages: (id: string) => Promise<void>;
  fetchHistory: (id: string) => Promise<void>;
  clearSelected: () => void;

  initSocket: (token: string) => void;
  disconnectSocket: () => void;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  stats: null,
  tickets: [],
  agents: [],
  selectedTicket: null,
  messages: [],
  history: [],
  loading: false,
  error: null,

  fetchStats: async () => {
    try {
      const res = await api.get("/api/admin/stats");
      set({ stats: res.data.data });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to load stats";
      toast.error(errorMessage, {
        style: { borderRadius: "10px", background: "#25671E", color: "#fff" },
      });
      set({ error: errorMessage, loading: false });
    }
  },

  fetchTickets: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/api/tickets/admin");
      set({ tickets: res.data.data, loading: false });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to load tickets";
      toast.error(errorMessage, {
        style: { borderRadius: "10px", background: "#25671E", color: "#fff" },
      });
      set({ error: errorMessage, loading: false });
    }
  },

  fetchAgents: async () => {
    try {
      const res = await api.get("/api/admin/agents");
      set({ agents: res.data.data });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to load agents";
      toast.error(errorMessage, {
        style: { borderRadius: "10px", background: "#25671E", color: "#fff" },
      });
      set({ error: errorMessage, loading: false });
    }
  },

  createAgent: async (data) => {
    try {
      await api.post("/api/admin/agents", data);
      toast.success("Agent created successfully", {
        style: { borderRadius: "10px", background: "#25671E", color: "#fff" },
      });
      get().fetchStats();
      get().fetchAgents();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to create agent";
      toast.error(errorMessage, {
        style: { borderRadius: "10px", background: "#25671E", color: "#fff" },
      });
      set({ error: errorMessage, loading: false });
    }
  },

  fetchTicketDetails: async (id: string) => {
    const prevId = get().selectedTicket?.id;
    if (prevId && prevId !== id) leaveTicketRoom(prevId);

    set({ loading: true, error: null });
    try {
      const res = await api.get(`/api/tickets/${id}`);
      set({ selectedTicket: res.data.data, loading: false });
      joinTicketRoom(id);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to load ticket";
      toast.error(msg, {
        style: { borderRadius: "10px", background: "#25671E", color: "#fff" },
      });
      set({ error: msg, loading: false });
    }
  },

  fetchMessages: async (id: string) => {
    try {
      const res = await api.get(`/api/tickets/${id}/messages`);
      set({ messages: res.data.data });
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to load messages";
      toast.error(msg, {
        style: { borderRadius: "10px", background: "#25671E", color: "#fff" },
      });
    }
  },

  fetchHistory: async (id: string) => {
    try {
      const res = await api.get(`/api/tickets/${id}/history`);
      set({ history: res.data.data });
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to load history";
      toast.error(msg, {
        style: { borderRadius: "10px", background: "#25671E", color: "#fff" },
      });
    }
  },

  clearSelected: () => {
    const ticketId = get().selectedTicket?.id;
    if (ticketId) leaveTicketRoom(ticketId);
    set({ selectedTicket: null, messages: [], history: [], error: null });
  },

  initSocket: (token) => {
    const socket = connectSocket(token);
    if (!socket) return;

    if ((socket as any)._adminListeners) return;
    (socket as any)._adminListeners = true;

    socket.on("ticket_created", (ticket: Tickets) => {
      set((state) => {
        if (state.tickets.find((t) => t.id === ticket.id)) return state;
        return { tickets: [ticket, ...state.tickets] };
      });
      get().fetchStats();
    });

    socket.on("ticket_assigned", (ticket: Tickets) => {
      set((state) => ({
        tickets: state.tickets.map((t) => (t.id === ticket.id ? ticket : t)),
      }));
      get().fetchStats();
      get().fetchAgents();
    });

    socket.on("ticket_status_updated", (ticket: Tickets) => {
      set((state) => ({
        tickets: state.tickets.map((t) => (t.id === ticket.id ? ticket : t)),
        selectedTicket:
          state.selectedTicket?.id === ticket.id
            ? ticket
            : state.selectedTicket,
      }));
      get().fetchStats();
      get().fetchAgents();
    });
  },

  disconnectSocket: () => {
    const socket = getSocket();
    if (socket && (socket as any)._adminListeners) {
      socket.off("ticket_created");
      socket.off("ticket_assigned");
      socket.off("ticket_status_updated");
      (socket as any)._adminListeners = false;
    }
  },
}));
