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
    return res.status(201).json({ success: true, data: tickets });
  } catch (error) {
    next(error);
  }
};

export const getCustomerTicketDetails = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ticketId = req.params.id as string;
    const customerId = req.user?.id as string;

    const tickets = await ticketService.getCustomerTicketDetails(
      ticketId,
      customerId,
    );
    return res.status(201).json({ success: true, data: tickets });
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

    const tickets = await ticketService.getAgentTickets(agentId);

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

    const validatedUpdateData = updateTicketStatusSchema.parse(req.body);

    const updatedTicket = await ticketService.updateTicketStatus(
      ticketId,
      userId,
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

    const validatedUpdateData = updateTicketPrioritySchema.parse(req.body);

    const updatedTicket = await ticketService.updateTicketPriority(
      ticketId,
      userId,
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
