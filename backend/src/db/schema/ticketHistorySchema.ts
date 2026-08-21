import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { tickets, ticketStatus } from "./ticketSchema.js";
import { users } from "./userSchema.js";
import { relations } from "drizzle-orm";

export const ticketHistoryAction = pgEnum("ticket_history_action", [
  "CREATED",
  "STATUS_CHANGED",
  "ASSIGNED",
]);

export const ticketHistory = pgTable(
  "ticket_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ticketId: uuid("ticket_id").references(() => tickets.id, {
      onDelete: "cascade",
    }),
    changedBy: uuid("changed_by").references(() => users.id, {
      onDelete: "set null",
    }),

    action: ticketHistoryAction("action").notNull(),

    oldStatus: ticketStatus("old_status"),

    newStatus: ticketStatus("new_status"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("ticket_history_ticket_idx").on(table.ticketId, table.createdAt),
  ],
);

export const ticketHistoryRelations = relations(ticketHistory, ({ one }) => ({
  ticket: one(tickets, {
    fields: [ticketHistory.ticketId],
    references: [tickets.id],
  }),
  user: one(users, {
    fields: [ticketHistory.changedBy],
    references: [users.id],
  }),
}));
