import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./userSchema.js";
import { relations } from "drizzle-orm";
import { ticketMessages } from "./ticketMessageSchema.js";

export const ticketStatus = pgEnum("ticket_status", [
  "WAITING",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
  "CANCELLED",
]);

export const ticketPriority = pgEnum("ticket_priority", [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
]);

export const tickets = pgTable(
  "tickets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    customerId: uuid("customer_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    // "set null" preserves the ticket history if the agent account is deleted.
    agentId: uuid("agent_id").references(() => users.id, {
      onDelete: "set null",
    }),

    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    status: ticketStatus("status").default("WAITING").notNull(),
    priority: ticketPriority("priority").default("MEDIUM").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),

    assignedAt: timestamp("assigned_at"),
    startedAt: timestamp("started_at"),
    resolvedAt: timestamp("resolved_at"),
  },
  (table) => [
    index("status_created_at_idx").on(table.status, table.createdAt),
    index("agent_status_idx").on(table.agentId),
    index("customer_id_idx").on(table.customerId),
  ],
);

export const ticketRelations = relations(tickets, ({ one, many }) => ({
  customer: one(users, {
    fields: [tickets.customerId],
    references: [users.id],
    relationName: "customer_tickets",
  }),
  agent: one(users, {
    fields: [tickets.agentId],
    references: [users.id],
    relationName: "agent_tickets",
  }),
  messages: many(ticketMessages),
}));
