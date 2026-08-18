import * as ticketRepo from "../repositories/ticketRepo.js";
import * as messageRepo from "../repositories/ticketMessageRepo.js";
import { MessageDocument } from "../repositories/ticketMessageRepo.js";
import { ApiError } from "../utils/apiError.js";
import { SendMessageInput } from "../validators/messageValidator.js";

const verifyTicketAccess = async (
  ticketId: string,
  userId: string,
  userRole: string,
) => {
  const ticket = await ticketRepo.findTicketById(ticketId);
  if (!ticket) {
    throw new ApiError(404, "Ticket not found");
  }

  if (userRole === "admin") return ticket;

  const isCustomer = ticket.customerId === userId;
  const isAssignedAgent = ticket.agentId === userId;

  if (!isCustomer && !isAssignedAgent) {
    throw new ApiError(403, "You do not have access to this ticket");
  }

  return ticket;
};

export const sendMessage = async (
  ticketId: string,
  userId: string,
  userRole: string,
  text: SendMessageInput,
): Promise<MessageDocument> => {
  const ticket = await verifyTicketAccess(ticketId, userId, userRole);

  if (ticket.status === "CLOSED" || ticket.status === "CANCELLED") {
    throw new ApiError(
      400,
      "Cannot send messages to a closed or cancelled ticket",
    );
  }

  const message = await messageRepo.createMessage({
    ticketId,
    senderId: userId,
    message: text.message,
  });

  return message;
};

export const getTicketMessages = async (
  ticketId: string,
  userId: string,
  userRole: string,
): Promise<MessageDocument[]> => {
  // verify access before returning the chat history
  await verifyTicketAccess(ticketId, userId, userRole);

  const messages = await messageRepo.getMessagesByTicketId(ticketId);
  return messages;
};
