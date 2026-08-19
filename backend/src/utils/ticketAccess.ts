import * as ticketRepo from "../repositories/ticketRepo.js";
import { ApiError } from "../utils/apiError.js";

export const verifyTicketAccess = async (
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
