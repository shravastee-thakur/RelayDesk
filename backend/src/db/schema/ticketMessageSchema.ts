import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { tickets } from "./ticketSchema.js";
import { users } from "./userSchema.js";
import { relations } from "drizzle-orm";

export const ticketMessages = pgTable(
  "ticket_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    ticketId: uuid("ticket_id")
      .references(() => tickets.id, { onDelete: "cascade" })
      .notNull(),
    senderId: uuid("sender_id")
      .references(() => users.id, { onDelete: "set null" })
      .notNull(),
    message: text("message").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    // speeds up loading the chat history for a specific ticket.
    index("ticket_messages_ticket_id_idx").on(table.ticketId, table.createdAt),
  ],
);

export const ticketMessagesRelations = relations(ticketMessages, ({ one }) => ({
  ticket: one(tickets, {
    fields: [ticketMessages.ticketId],
    references: [tickets.id],
  }),
  sender: one(users, {
    fields: [ticketMessages.senderId],
    references: [users.id],
  }),
}));
