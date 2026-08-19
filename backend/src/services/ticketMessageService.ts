import * as messageRepo from "../repositories/ticketMessageRepo.js";
import { MessageDocument } from "../repositories/ticketMessageRepo.js";
import { ApiError } from "../utils/apiError.js";
import { verifyTicketAccess } from "../utils/ticketAccess.js";
import { SendMessageInput } from "../validators/messageValidator.js";

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
