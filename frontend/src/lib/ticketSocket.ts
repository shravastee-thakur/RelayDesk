import { getSocket } from "./socket";
import { useAgentTicketStore } from "../store/agentTicketStore";
import { useCustomerTicketStore } from "../store/customerTicketStore";
import type { TicketMessage } from "../types/ticket";

export const setupTicketSocketListeners = () => {
  const s = getSocket();
  if (!s) return;

  if ((s as any)._chatListenersAttached) return;
  (s as any)._chatListenersAttached = true;

  s.on("new_message", (msg: TicketMessage) => {
    console.log("🔥 [Chat] RECEIVED new_message:", msg);

    const agentState = useAgentTicketStore.getState();
    if (agentState.selectedTicket?.id === msg.ticketId) {
      if (!agentState.messages.find((m) => m.id === msg.id)) {
        useAgentTicketStore.setState({
          messages: [...agentState.messages, msg],
        });
      }
    }

    const customerState = useCustomerTicketStore.getState();
    if (customerState.selectedTicket?.id === msg.ticketId) {
      if (!customerState.messages.find((m) => m.id === msg.id)) {
        useCustomerTicketStore.setState({
          messages: [...customerState.messages, msg],
        });
      }
    }
  });
};

export const teardownTicketSocketListeners = () => {
  // Handled by disconnectSocket
};
