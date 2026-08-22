import { Request, Response, NextFunction } from "express";
import * as userService from "../services/userService.js";
import logger from "../utils/logger.js";
import { createAgentSchema } from "../validators/authValidator.js";
import * as ticketService from "../services/ticketService.js";

export const createAgent = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validatedData = createAgentSchema.parse(req.body);
    const agent = await userService.createAgent(validatedData);

    logger.info(`Admin created new agent: ${agent.email}`);

    return res.status(201).json({
      success: true,
      message: "Agent created successfully",
      data: agent,
    });
  } catch (error) {
    next(error);
  }
};

export const getStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const stats = await ticketService.getAdminStats();

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
