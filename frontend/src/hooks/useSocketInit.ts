import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useAgentTicketStore } from "../store/agentTicketStore";
import { useCustomerTicketStore } from "../store/customerTicketStore";
import {
  setupTicketSocketListeners,
  teardownTicketSocketListeners,
} from "../lib/ticketSocket";

export function useSocketInit() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  const initAgentSocket = useAgentTicketStore((s) => s.initSocket);
  const disconnectAgentSocket = useAgentTicketStore((s) => s.disconnectSocket);

  const initCustomerSocket = useCustomerTicketStore((s) => s.initSocket);
  const disconnectCustomerSocket = useCustomerTicketStore(
    (s) => s.disconnectSocket,
  );

  useEffect(() => {
    if (isAuthenticated && token && user?.id) {
      initAgentSocket(token, user.id);
      initCustomerSocket(token);
      setupTicketSocketListeners();
    } else {
      teardownTicketSocketListeners();
      disconnectAgentSocket();
      disconnectCustomerSocket();
    }
  }, [
    isAuthenticated,
    token,
    user?.id,
    initAgentSocket,
    disconnectAgentSocket,
    initCustomerSocket,
    disconnectCustomerSocket,
  ]);
}

