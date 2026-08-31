import { create } from "zustand";
import api from "../utils/api";
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
}

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

      set({
        error: errorMessage,
        loading: false,
      });
    }
  },

  fetchQueue: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/api/tickets/queue");
      set({ queue: res.data.data, loading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to load queue",
        loading: false,
      });
    }
  },

  fetchAgentHistory: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("api/tickets/agent/history");
      set({ historyTickets: res.data.data, loading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to load history",
        loading: false,
      });
    }
  },

  takeNextTicket: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.post("/api/tickets/assign-next");
      const ticket: Tickets = res.data.data;
      set({
        activeTickets: [...get().activeTickets, ticket],
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

      set({
        error: errorMessage,
        loading: false,
      });
      throw err;
    }
  },

  startTicket: async (id: string) => {
    try {
      const res = await api.patch(`/api/tickets/${id}/start`);
      set({
        activeTickets: get().activeTickets.map((t) =>
          t.id === id ? res.data.data : t,
        ),
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

      set({
        error: errorMessage,
        loading: false,
      });
    }
  },

  resolveTicket: async (id: string) => {
    try {
      const res = await api.patch(`/api/tickets/${id}/resolve`);
      set({
        activeTickets: get().activeTickets.map((t) =>
          t.id === id ? res.data.data : t,
        ),
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

      set({
        error: errorMessage,
        loading: false,
      });
    }
  },

  fetchTicketDetails: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`api/tickets/${id}`);
      set({ selectedTicket: res.data.data, loading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to load ticket",
        loading: false,
      });
    }
  },

  fetchMessages: async (id) => {
    try {
      const res = await api.get(`api/tickets/${id}/messages`);
      set({ messages: res.data.data });
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Failed to load messages" });
    }
  },

  fetchHistory: async (id) => {
    try {
      const res = await api.get(`api/tickets/${id}/history`);
      set({ history: res.data.data });
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Failed to load history" });
    }
  },

  closeTicket: async (id) => {
    try {
      const res = await api.patch(`api/tickets/${id}/close`);
      set({
        selectedTicket: res.data.data,
        activeTickets: get().activeTickets.map((t) =>
          t.id === id ? res.data.data : t,
        ),
      });
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Failed to close ticket" });
    }
  },

  updatePriority: async (id, priority) => {
    try {
      const res = await api.patch(`api/tickets/${id}/priority`, { priority });
      set({
        selectedTicket: res.data.data,
        activeTickets: get().activeTickets.map((t) =>
          t.id === id ? res.data.data : t,
        ),
      });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to update priority",
      });
    }
  },

  sendMessage: async (ticketId, content) => {
    try {
      await api.post(`api/tickets/${ticketId}/messages`, { content });
      get().fetchMessages(ticketId);
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Failed to send message" });
    }
  },

  clearSelected: () =>
    set({ selectedTicket: null, messages: [], history: [], error: null }),
}));
