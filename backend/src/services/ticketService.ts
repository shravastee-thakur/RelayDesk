import * as ticketRepo from "../repositories/ticketRepo.js";
import { TicketDocument } from "../repositories/ticketRepo.js";
import * as socketEmitter from "../sockets/socketEmitter.js";
import { ApiError } from "../utils/apiError.js";
import { calculatePriority } from "../utils/priorityCalculator.js";
import {
  CreateTicketInput,
  UpdateTicketStatusInput,
  UpdateTicketPriorityInput,
} from "../validators/ticketValidator.js";

import * as ticketHistoryService from "../services/ticketHistoryService.js";
import * as redisPresenceService from "./redisPresenceService.js";

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

  await ticketHistoryService.recordHistory({
    ticketId: ticket.id,
    changedBy: customerId,
    action: "CREATED",
    newStatus: ticket.status,
  });

  socketEmitter.emitToAgentDashboard("ticket_created", ticket);

  return ticket;
};

export const getCustomerTickets = async (
  customerId: string,
): Promise<TicketDocument[]> => {
  const tickets = await ticketRepo.findCustomerTickets(customerId);
  return tickets;
};

export const getTicketDetails = async (
  ticketId: string,
  userId: string,
  userRole: string,
): Promise<TicketDocument> => {
  const ticketDetails = await ticketRepo.findTicketWithUsers(ticketId);
  if (!ticketDetails) {
    throw new ApiError(404, "Tickets not found");
  }

  if (userRole === "admin") {
    return ticketDetails;
  }

  // Customers can only see tickets they created
  if (userRole === "customer" && ticketDetails.customerId !== userId) {
    throw new ApiError(403, "You cannot access this ticket");
  }
  // Agents can only see tickets assigned to them
  if (userRole === "agent" && ticketDetails.agentId !== userId) {
    throw new ApiError(403, "You can only view tickets assigned to you");
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

const MAX_ACTIVE_TICKETS = 5;

export const assignNextTicket = async (
  agentId: string,
): Promise<TicketDocument> => {
  const activeCount = await ticketRepo.countActiveAgentTickets(agentId);

  if (activeCount >= MAX_ACTIVE_TICKETS) {
    throw new ApiError(
      400,
      `You have reached the limit of ${MAX_ACTIVE_TICKETS} active tickets. Please resolve some before taking more.`,
    );
  }

  const ticket = await ticketRepo.assignNextTicket(agentId);
  if (!ticket) {
    throw new ApiError(404, "No waiting tickets available");
  }

  await ticketHistoryService.recordHistory({
    ticketId: ticket.id,
    changedBy: agentId,
    action: "ASSIGNED",
    oldStatus: "WAITING",
    newStatus: ticket.status,
  });

  socketEmitter.emitToAgentDashboard("ticket_assigned", ticket);
  socketEmitter.emitToTicketRoom(ticket.id, "ticket_assigned", ticket);

  return ticket;
};

// agent dashboard
export const getAgentTickets = async (
  agentId: string,
  page: number = 1,
  limit: number = 20,
): Promise<TicketDocument[]> => {
  const offset = (page - 1) * limit;
  const tickets = await ticketRepo.findAgentTickets(agentId, limit, offset);
  return tickets;
};

export const getActiveAgentTickets = async (
  agentId: string,
): Promise<TicketDocument[]> => {
  const tickets = await ticketRepo.findActiveAgentTickets(agentId);
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

  await ticketHistoryService.recordHistory({
    ticketId,
    changedBy: userId,
    action: "STATUS_CHANGED",
    oldStatus: ticket.status,
    newStatus: newStatus,
  });

  socketEmitter.emitToTicketRoom(updated.id, "ticket_status_updated", updated);
  socketEmitter.emitToAgentDashboard("ticket_status_updated", updated);

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

export const startTicket = async (
  ticketId: string,
  agentId: string,
): Promise<TicketDocument> => {
  return await updateTicketStatus(ticketId, agentId, "agent", {
    status: "IN_PROGRESS",
  });
};

export const resolveTicket = async (ticketId: string, agentId: string) => {
  return await updateTicketStatus(ticketId, agentId, "agent", {
    status: "RESOLVED",
  });
};

export const closeTicket = async (
  ticketId: string,
  userId: string,
  userRole: string,
) => {
  return await updateTicketStatus(ticketId, userId, userRole, {
    status: "CLOSED",
  });
};

// Admin
export const getAllTickets = async (page: number = 1, limit: number = 20) => {
  const offset = (page - 1) * limit;
  return ticketRepo.findAllTickets(limit, offset);
};

export const getAdminStats = async () => {
  const ticketStats = await ticketRepo.getTicketStats();
  const totalAgents = await ticketRepo.getAgentCount();
  const onlineAgents = await redisPresenceService.getOnlineAgentCount();

  return {
    ...ticketStats,
    totalAgents,
    onlineAgents,
  };
};
