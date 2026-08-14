import * as ticketRepo from "../repositories/ticketRepo.js";
import { TicketDocument } from "../repositories/ticketRepo.js";
import { ApiError } from "../utils/apiError.js";
import {
  CreateTicketInput,
  UpdateTicketInput,
} from "../validators/ticketValidator.js";

export const createTicket = async (
  ticketData: CreateTicketInput,
): Promise<TicketDocument> => {
  const ticket = await ticketRepo.createTicket(ticketData);
  if (!ticket) {
    throw new ApiError(500, "Problem in generating ticket");
  }

  return ticket;
};

export const getCustomerTickets = async (
  customerId: string,
): Promise<TicketDocument[]> => {
  const tickets = await ticketRepo.findCustomerTickets(customerId);
  return tickets;
};

export const getCustomerTicketDetails = async (ticketId: string) => {
  const ticketDetails = await ticketRepo.findTicketById(ticketId);
  if (!ticketDetails) {
    throw new ApiError(404, "Tickets not found");
  }

  return ticketDetails;
};

export const getWaitingTickets = async (
  page: number = 1,
  limit: number = 20,
): Promise<TicketDocument[]> => {
  const offset = (page - 1) * limit;
  const queue = await ticketRepo.findWaitingTickets(limit, offset);

  return queue;
};

export const assignNextTicket = async (agentId: string) => {
  const ticket = await ticketRepo.assignNextTicket(agentId);
  if (!ticket) {
    throw new ApiError(404, "No waiting tickets in the queue right now");
  }

  return ticket;
};

export const updateTicketStatus = async (
  ticketId: string,
  userId: string,
  userRole: "customer" | "agent" | "admin",
  updateData: UpdateTicketInput,
): Promise<TicketDocument> => {
  const ticket = await ticketRepo.findTicketById(ticketId);
  if (!ticket) {
    throw new ApiError(404, "Ticket not found");
  }

  const newStatus = updateData.status;
  if (!newStatus) {
    throw new ApiError(400, "Status is required");
  }

  if (userRole === "customer") {
    if (ticket.customerId !== userId || newStatus !== "CANCELLED") {
      throw new ApiError(403, "Customer cannot perform this action");
    }
  }

  if (userRole === "agent") {
    if (ticket.agentId !== userId) {
      throw new ApiError(403, "You are not assigned to this ticket");
    }
  }

  const allowedTransitions = {
    WAITING: ["CANCELLED"],
    ASSIGNED: ["IN_PROGRESS"],
    IN_PROGRESS: ["RESOLVED"],
    RESOLVED: ["CLOSED"],
    CLOSED: [],
    CANCELLED: [],
  };

  if (!allowedTransitions[ticket.status].includes(newStatus)) {
    throw new ApiError(400, "Invalid status transition");
  }

  const updated = await ticketRepo.updateStatus(ticketId, {
    status: newStatus,
    ...(newStatus === "IN_PROGRESS" && { startedAt: new Date() }),
    ...(newStatus === "RESOLVED" && { resolvedAt: new Date() }),
  });

  if (!updated) {
    throw new ApiError(500, "Failed to update ticket");
  }

  return updated;
};
