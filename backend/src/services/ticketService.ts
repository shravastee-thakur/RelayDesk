import * as ticketRepo from "../repositories/ticketRepo.js";
import { TicketDocument } from "../repositories/ticketRepo.js";
import { ApiError } from "../utils/apiError.js";
import { calculatePriority } from "../utils/priorityCalculator.js";
import {
  CreateTicketInput,
  UpdateTicketStatusInput,
  UpdateTicketPriorityInput,
} from "../validators/ticketValidator.js";

export const createTicket = async (
  customerId: string,
  ticketData: CreateTicketInput,
): Promise<TicketDocument> => {
  const priority = calculatePriority(ticketData.title, ticketData.description);

  const ticket = await ticketRepo.createTicket({
    customerId,
    title: ticketData.title,
    description: ticketData.description,
    priority,
  });
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

export const getCustomerTicketDetails = async (
  ticketId: string,
  customerId: string,
): Promise<TicketDocument> => {
  const ticketDetails = await ticketRepo.findTicketById(ticketId);
  if (!ticketDetails) {
    throw new ApiError(404, "Tickets not found");
  }

  if (ticketDetails.customerId !== customerId) {
    throw new ApiError(403, "You cannot access this ticket");
  }

  return ticketDetails;
};

export const getAgentQueue = async (
  page: number = 1,
  limit: number = 20,
): Promise<TicketDocument[]> => {
  const offset = (page - 1) * limit;
  const queue = await ticketRepo.findWaitingTickets(limit, offset);

  return queue;
};

export const assignNextTicket = async (
  agentId: string,
): Promise<TicketDocument> => {
  const ticket = await ticketRepo.assignNextTicket(agentId);
  if (!ticket) {
    throw new ApiError(404, "No waiting tickets available");
  }

  return ticket;
};

// agent dashboard
export const getAgentTickets = async (
  agentId: string,
): Promise<TicketDocument[]> => {
  const tickets = await ticketRepo.findAgentTickets(agentId);
  return tickets;
};

export const updateTicketStatus = async (
  ticketId: string,
  userId: string,
  userRole: string,
  updateData: UpdateTicketStatusInput,
): Promise<TicketDocument> => {
  const ticket = await ticketRepo.findTicketById(ticketId);
  if (!ticket) {
    throw new ApiError(404, "Ticket not found");
  }

  const newStatus = updateData.status;
  if (!newStatus) {
    throw new ApiError(400, "Status is required");
  }

  if (userRole !== "admin") {
    if (ticket.status === "WAITING") {
      // If it's waiting, only the customer who created it should be able to cancel it
      if (ticket.customerId !== userId) {
        throw new ApiError(
          403,
          "You do not have permission to cancel this ticket",
        );
      }
    } else {
      // If an agent has picked it up, only that specific agent can update it
      if (ticket.agentId !== userId) {
        throw new ApiError(403, "You are not assigned to this ticket");
      }
    }
  }
  type TicketStatus = TicketDocument["status"];

  const allowedTransitions: Record<TicketStatus, TicketStatus[]> = {
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

  const updated = await ticketRepo.updateTicket(ticketId, {
    status: newStatus,
    ...(newStatus === "IN_PROGRESS" && { startedAt: new Date() }),
    ...(newStatus === "RESOLVED" && { resolvedAt: new Date() }),
  });

  if (!updated) {
    throw new ApiError(500, "Failed to update ticket");
  }

  return updated;
};

export const updateTicketPriority = async (
  ticketId: string,
  userId: string,
  userRole: string,
  updateData: UpdateTicketPriorityInput,
): Promise<TicketDocument> => {
  const ticket = await ticketRepo.findTicketById(ticketId);
  if (!ticket) {
    throw new ApiError(404, "Ticket not found");
  }

  // only assigned agent can modify priority
  if (userRole !== "admin" && ticket.agentId !== userId) {
    throw new ApiError(403, "You are not assigned to this ticket");
  }

  const updatedTicket = await ticketRepo.updateTicket(ticketId, {
    priority: updateData.priority,
  });

  if (!updatedTicket) {
    throw new ApiError(500, "Failed to update priority");
  }

  return updatedTicket;
};
