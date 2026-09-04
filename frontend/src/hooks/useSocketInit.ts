import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useAgentTicketStore } from "../store/agentTicketStore";
import {
  setupTicketSocketListeners,
  teardownTicketSocketListeners,
} from "../lib/ticketSocket";

export function useSocketInit() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const initSocket = useAgentTicketStore((s) => s.initSocket);
  const disconnect = useAgentTicketStore((s) => s.disconnectSocket);

  useEffect(() => {
    if (isAuthenticated && token && user?.id) {
      initSocket(token, user.id);
      setupTicketSocketListeners();
    } else {
      teardownTicketSocketListeners();
      disconnect();
    }
  }, [isAuthenticated, token, user?.id, initSocket, disconnect]);
}

// Hello, I cannot export reports.

// I am checking this.
