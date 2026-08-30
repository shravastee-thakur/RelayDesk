import { create } from "zustand";
import api from "../utils/api";
import type { Ticket } from "../types/ticket";
import toast from "react-hot-toast";

interface AgentTicketState {
  activeTickets: Ticket[];
  queue: Ticket[];
  loading: boolean;
  error: string | null;

  fetchActiveTickets: () => Promise<void>;
  fetchQueue: () => Promise<void>;
  takeNextTicket: () => Promise<Ticket>;
  startTicket: (id: string) => Promise<void>;
  resolveTicket: (id: string) => Promise<void>;
}

export const useAgentTicketStore = create<AgentTicketState>((set, get) => ({
  activeTickets: [],
  queue: [],
  loading: false,
  error: null,

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

  takeNextTicket: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.post("/api/tickets/assign-next");
      const ticket: Ticket = res.data.data;
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
}));
