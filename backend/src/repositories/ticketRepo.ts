import { and, asc, count, eq, lt } from "drizzle-orm";
import { db } from "../db/index.js";
import { tickets } from "../db/schema/ticketSchema.js";

export type TicketDocument = typeof tickets.$inferSelect;
export type BaseTicketData = typeof tickets.$inferInsert;

export type CreateTicketData = Pick<
  BaseTicketData,
  "customerId" | "title" | "description" | "priority"
>;

export type UpdateTicketData = Partial<
  Omit<TicketDocument, "id" | "createdAt">
>;

export const createTicket = async (
  ticketData: CreateTicketData,
): Promise<TicketDocument> => {
  const [ticket] = await db.insert(tickets).values(ticketData).returning();
  return ticket;
};

export const findTicketById = async (
  ticketId: string,
): Promise<TicketDocument | null> => {
  const [ticket] = await db
    .select()
    .from(tickets)
    .where(eq(tickets.id, ticketId));
  return ticket ?? null;
};

export const findCustomerTickets = async (
  customerId: string,
): Promise<TicketDocument[]> => {
  const customerTickets = await db
    .select()
    .from(tickets)
    .where(eq(tickets.customerId, customerId))
    .orderBy(asc(tickets.createdAt));

  return customerTickets;
};

export const findWaitingTickets = async (): Promise<TicketDocument[]> => {
  const ticket = await db
    .select()
    .from(tickets)
    .where(eq(tickets.status, "WAITING"))
    .orderBy(asc(tickets.createdAt));
  return ticket;
};

export const findAgentTickets = async (
  agentId: string,
): Promise<TicketDocument[]> => {
  const agentTickets = await db
    .select()
    .from(tickets)
    .where(eq(tickets.agentId, agentId))
    .orderBy(asc(tickets.createdAt));

  return agentTickets;
};

// If the person at the front of the line gets assigned, your ticket instantly becomes position 1 without a single database update.
export const getQueuePosition = async (createdAt: Date): Promise<number> => {
  const [result] = await db
    .select({ count: count() })
    .from(tickets)
    .where(
      and(eq(tickets.status, "WAITING"), lt(tickets.createdAt, createdAt)),
    );

  return (result?.count ?? 0) + 1;
};

export const updateStatus = async (
  ticketId: string,
  updates: UpdateTicketData,
): Promise<TicketDocument | null> => {
  const [ticket] = await db
    .update(tickets)
    .set(updates)
    .where(eq(tickets.id, ticketId))
    .returning();

  return ticket ?? null;
};

export const assignNextTicket = async (
  agentId: string,
): Promise<TicketDocument | null> => {
  return db.transaction(async (tx) => {
    const [lockedTicket] = await tx
      .select()
      .from(tickets)
      .where(eq(tickets.status, "WAITING"))
      .orderBy(asc(tickets.createdAt))
      .limit(1)
      .for("update", { skipLocked: true });

    if (!lockedTicket) {
      return null;
    }

    const [assignedTicket] = await tx
      .update(tickets)
      .set({ agentId, status: "ASSIGNED", assignedAt: new Date() })
      .where(eq(tickets.id, lockedTicket.id))
      .returning();

    return assignedTicket ?? null;
  });
};
