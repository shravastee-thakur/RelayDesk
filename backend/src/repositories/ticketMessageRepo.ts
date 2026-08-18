import { eq, asc } from "drizzle-orm";
import { db } from "../db/index.js";
import { ticketMessages } from "../db/schema/ticketMessageSchema.js";

export type MessageDocument = typeof ticketMessages.$inferSelect;
export type CreateMessageData = typeof ticketMessages.$inferInsert;

export const createMessage = async (
  data: CreateMessageData,
): Promise<MessageDocument> => {
  const [message] = await db.insert(ticketMessages).values(data).returning();
  return message;
};

export const getMessagesByTicketId = async (
  ticketId: string,
): Promise<MessageDocument[]> => {
  const messages = await db
    .select()
    .from(ticketMessages)
    .where(eq(ticketMessages.ticketId, ticketId))
    .orderBy(asc(ticketMessages.createdAt));

  return messages;
};
