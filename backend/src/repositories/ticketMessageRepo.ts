import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { ticketMessages } from "../db/schema/ticketMessageSchema.js";

export type MessageDocument = typeof ticketMessages.$inferSelect;
export type BaseMessageData = typeof ticketMessages.$inferInsert;

export type CreateMessageData = Pick<
  BaseMessageData,
  "ticketId" | "senderId" | "message"
>;

export const createMessage = async (
  messageData: CreateMessageData,
): Promise<MessageDocument> => {
  const [messages] = await db.insert(ticketMessages).values(messageData);
  return messages;
};

export const getTicketMessages = async (): Promise<MessageDocument[]> => {
  const [messages] = await db.select().from(ticketMessages).where(eq())
};
