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

/*

1. Remove console.log
2. Extract duplicated formatRelativeTime
3. Fix Unnecessary Rerenders (Memoization)
4. Fix Queue Cache Issue

also 
agentTicketStore.initSocket → handles ticket_created, ticket_assigned, ticket_status_updated for agent-specific updates
customerTicketStore.initSocket → handles ticket_assigned, ticket_status_updated for customer-specific updates
ticketSocket.ts → ONLY handles new_message for both stores' chat

these are the changes ive made
is that all ? we finally done? with this part

*/
