import * as ticketHistoryRepo from "../repositories/ticketHistoryRepo.js";
import {
  CreateHistoryData,
  HistoryDocument,
} from "../repositories/ticketHistoryRepo.js";
import logger from "../utils/logger.js";
import { verifyTicketAccess } from "../utils/ticketAccess.js";

export const recordHistory = async (data: CreateHistoryData) => {
  try {
    await ticketHistoryRepo.createHistory(data);
  } catch (error) {
    logger.error(`History recording failed: ${(error as Error).message}`);
  }
};

export const getHistory = async (
  ticketId: string,
  userId: string,
  userRole: string,
): Promise<HistoryDocument[]> => {
  await verifyTicketAccess(ticketId, userId, userRole);
  return ticketHistoryRepo.findTicketHistory(ticketId);
};
