import { Request, Response, NextFunction } from "express";
import * as ticketService from "../services/ticketService.js";
import {
  createTicketSchema,
  updateTicketPrioritySchema,
  updateTicketStatusSchema,
} from "../validators/ticketValidator.js";
import logger from "../utils/logger.js";

export const createTicket = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const customerId = req.user?.id as string;
    const validatedData = createTicketSchema.parse(req.body);

    const ticket = await ticketService.createTicket(customerId, validatedData);
    logger.info(`Ticket ${ticket.id} generated`);
    return res.status(201).json({
      success: true,
      message: "Ticket generated successfully",
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerTickets = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const customerId = req.user?.id as string;

    const tickets = await ticketService.getCustomerTickets(customerId);
    return res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    next(error);
  }
};

export const getTicketDetails = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ticketId = req.params.id as string;
    const userId = req.user?.id as string;
    const userRole = req.user?.role as string;

    const tickets = await ticketService.getTicketDetails(
      ticketId,
      userId,
      userRole,
    );
    return res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    next(error);
  }
};

export const getWaitingTickets = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = Number(req.query.page) || 1;

    const limit = Number(req.query.limit) || 20;

    const tickets = await ticketService.getAgentQueue(page, limit);

    res.status(200).json({
      success: true,
      data: tickets,
    });
  } catch (error) {
    next(error);
  }
};

export const assignNextTicket = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const agentId = req.user?.id as string;

    const ticket = await ticketService.assignNextTicket(agentId);

    res.status(200).json({
      success: true,
      message: "Ticket assigned successfully",
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

export const getAgentTickets = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const agentId = req.user?.id as string;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const tickets = await ticketService.getAgentTickets(agentId, page, limit);

    res.status(200).json({
      success: true,
      data: tickets,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTicketStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ticketId = req.params.id as string;
    const userId = req.user?.id as string;
    const userRole = req.user?.role as string;

    const validatedUpdateData = updateTicketStatusSchema.parse(req.body);

    const updatedTicket = await ticketService.updateTicketStatus(
      ticketId,
      userId,
      userRole,
      validatedUpdateData,
    );

    res.status(200).json({
      success: true,
      message: "Ticket status updated",
      data: updatedTicket,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTicketPriority = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ticketId = req.params.id as string;
    const userId = req.user?.id as string;
    const userRole = req.user?.role as string;

    const validatedUpdateData = updateTicketPrioritySchema.parse(req.body);

    const updatedTicket = await ticketService.updateTicketPriority(
      ticketId,
      userId,
      userRole,
      validatedUpdateData,
    );

    res.status(200).json({
      success: true,
      message: "Ticket priority updated",
      data: updatedTicket,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelTicket = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ticketId = req.params.ticketId as string;
    const userId = req.user?.id as string;
    const userRole = req.user?.role as string;

    const updatedTicket = await ticketService.updateTicketStatus(
      ticketId,
      userId,
      userRole,
      {
        status: "CANCELLED",
      },
    );

    res.status(200).json({
      success: true,
      message: "Ticket cancelled",
      data: updatedTicket,
    });
  } catch (error) {
    next(error);
  }
};

export const getActiveAgentTickets = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const agentId = req.user?.id as string;
    const tickets = await ticketService.getActiveAgentTickets(agentId);
    res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    next(error);
  }
};

export const startTicket = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ticketId = req.params.id as string;
    const agentId = req.user?.id as string;
    const updatedTicket = await ticketService.startTicket(ticketId, agentId);
    res
      .status(200)
      .json({ success: true, message: "Ticket started", data: updatedTicket });
  } catch (error) {
    next(error);
  }
};

export const resolveTicket = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ticketId = req.params.id as string;
    const agentId = req.user?.id as string;
    const updatedTicket = await ticketService.resolveTicket(ticketId, agentId);
    res
      .status(200)
      .json({ success: true, message: "Ticket resolved", data: updatedTicket });
  } catch (error) {
    next(error);
  }
};

export const closeTicket = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ticketId = req.params.id as string;
    const userId = req.user?.id as string;
    const userRole = req.user?.role as string;
    const updatedTicket = await ticketService.closeTicket(
      ticketId,
      userId,
      userRole,
    );
    res
      .status(200)
      .json({ success: true, message: "Ticket closed", data: updatedTicket });
  } catch (error) {
    next(error);
  }
};

// Agent Management: Right now, your user registration defaults everyone to "customer". You need a dedicated POST /api/users/agent route restricted entirely to the Admin role. This is how you hire and fire support staff.
// Forced Reassignment: If an agent calls in sick or abandons a ticket, the Admin needs a way to manually reassign an active ticket to a different agent. You will eventually need an updateTicketAgent service function.
// Analytics Dashboard: The Admin interface requires aggregate statistics. You need a new GET /api/admin/stats route that runs SQL queries to calculate average time to assign and average time to resolve based on your timestamp columns.

// ✅ Authentication

// ✅ Ticket schema

// ✅ Ticket repository/service/controller 1

// ✅ Priority calculation

// ✅ Agent workflow improvement 2

// ✅ Ticket messages schema + CRUD 3

// ✅ Socket.IO: (Socket.IO Integration layer) 4
//        - real-time chat
//       - queue updates
//       - ticket assignment events
//       

// ⬜ Ticket history

// ⬜ Redis:
//       - online agents
//       - distributed locks
//       - caching

// ⬜ Deployment improvements

// 8. Admin
// Admin is simple.
// Admin sees:
// Total tickets
// Active agents
// Average resolution time
// Queries:
// How many tickets today?
// How many unresolved?
// Which agent solved most?
// src
// modules
//  ├── auth
//  │
//  ├── users
//  │
//  ├── tickets
//  │
//  ├── messages
//  │
//  ├── queue
//  │
//  └── agents
// socket
//  ├── ticketEvents.ts
//  ├── presenceEvents.ts
