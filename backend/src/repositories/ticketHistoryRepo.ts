import { asc, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { ticketHistory } from "../db/schema/ticketHistorySchema.js";

export type HistoryDocument = typeof ticketHistory.$inferSelect;
export type CreateHistoryData = typeof ticketHistory.$inferInsert;

export const createHistory = async (
  data: CreateHistoryData,
): Promise<HistoryDocument> => {
  const [entry] = await db.insert(ticketHistory).values(data).returning();

  return entry;
};

export const findTicketHistory = async (
  ticketId: string,
): Promise<HistoryDocument[]> => {
  const history = await db
    .select()
    .from(ticketHistory)
    .where(eq(ticketHistory.ticketId, ticketId))
    .orderBy(asc(ticketHistory.createdAt));

  return history;
};
