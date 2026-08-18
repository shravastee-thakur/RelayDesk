import { Request, Response, NextFunction } from "express";
import * as messageService from "../services/ticketMessageService.js";
import { sendMessageSchema } from "../validators/messageValidator.js";
import logger from "../utils/logger.js";

export const sendMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ticketId = req.params.id as string;
    const userId = req.user?.id as string;
    const userRole = req.user?.role as string;

    const validatedData = sendMessageSchema.parse(req.body);

    const message = await messageService.sendMessage(
      ticketId,
      userId,
      userRole,
      validatedData,
    );

    logger.info(`Message sent to ticket ${ticketId} by user ${userId}`);

    return res.status(201).json({
      success: true,
      message: "Message sent",
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

export const getTicketMessages = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ticketId = req.params.id as string;
    const userId = req.user?.id as string;
    const userRole = req.user?.role as string;

    const messages = await messageService.getTicketMessages(
      ticketId,
      userId,
      userRole,
    );

    return res.status(201).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};
