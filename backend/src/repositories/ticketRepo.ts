import { and, asc, count, desc, eq, inArray, lt, or } from "drizzle-orm";
import { db } from "../db/index.js";
import { tickets } from "../db/schema/ticketSchema.js";
import { users } from "../db/schema/userSchema.js";

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

export const findWaitingTickets = async (
  limit: number = 20,
  offset: number = 0,
): Promise<TicketDocument[]> => {
  const ticket = await db
    .select()
    .from(tickets)
    .where(eq(tickets.status, "WAITING"))
    .orderBy(desc(tickets.priority), asc(tickets.createdAt))
    .limit(limit)
    .offset(offset);
  return ticket;
};

export const findAgentTickets = async (
  agentId: string,
  limit: number = 20,
  offset: number = 0,
): Promise<TicketDocument[]> => {
  const agentTickets = await db
    .select()
    .from(tickets)
    .where(eq(tickets.agentId, agentId))
    .orderBy(desc(tickets.createdAt))
    .limit(limit)
    .offset(offset);

  return agentTickets;
};

export const findActiveAgentTickets = async (
  agentId: string,
): Promise<TicketDocument[]> => {
  const agentTickets = await db
    .select()
    .from(tickets)
    .where(
      and(
        eq(tickets.agentId, agentId),
        inArray(tickets.status, ["ASSIGNED", "IN_PROGRESS"]),
      ),
    )
    .orderBy(asc(tickets.createdAt));

  return agentTickets;
};

export const countActiveAgentTickets = async (agentId: string) => {
  const [result] = await db
    .select({ count: count() })
    .from(tickets)
    .where(
      and(
        eq(tickets.agentId, agentId),
        inArray(tickets.status, ["ASSIGNED", "IN_PROGRESS"]),
      ),
    );

  return result.count;
};

export const updateTicket = async (
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
      .orderBy(desc(tickets.priority), asc(tickets.createdAt))
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

// Admin
export const findAllTickets = async (
  limit: number = 20,
  offset: number = 0,
) => {
  const allTickets = await db.query.tickets.findMany({
    columns: {
      id: true,
      title: true,
      status: true,
      priority: true,
      createdAt: true,
    },
    with: {
      customer: {
        columns: { id: true, name: true, email: true },
      },
      agent: {
        columns: { id: true, name: true, email: true },
      },
    },
    orderBy: desc(tickets.createdAt),
    limit,
    offset,
  });

  return allTickets;
};

export const getTicketStats = async () => {
  // Fire all queries at the exact same time
  const [total, waiting, assigned, inProgress, resolved] = await Promise.all([
    db.select({ count: count() }).from(tickets),
    db
      .select({ count: count() })
      .from(tickets)
      .where(eq(tickets.status, "WAITING")),
    db
      .select({ count: count() })
      .from(tickets)
      .where(eq(tickets.status, "ASSIGNED")),
    db
      .select({ count: count() })
      .from(tickets)
      .where(eq(tickets.status, "IN_PROGRESS")),
    db
      .select({ count: count() })
      .from(tickets)
      .where(eq(tickets.status, "RESOLVED")),
  ]);

  return {
    totalTickets: total[0].count,
    waiting: waiting[0].count,
    assigned: assigned[0].count,
    inProgress: inProgress[0].count,
    resolved: resolved[0].count,
  };
};

export const getActiveAgentCount = async () => {
  const agents = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.role, "agent"));

  return agents[0].count;
};
