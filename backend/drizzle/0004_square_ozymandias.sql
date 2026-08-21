CREATE TYPE "public"."ticket_history_action" AS ENUM('CREATED', 'STATUS_CHANGED', 'ASSIGNED');--> statement-breakpoint
CREATE TABLE "ticket_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_id" uuid,
	"changed_by" uuid,
	"action" "ticket_history_action" NOT NULL,
	"old_status" "ticket_status",
	"new_status" "ticket_status",
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ticket_history" ADD CONSTRAINT "ticket_history_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_history" ADD CONSTRAINT "ticket_history_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ticket_history_ticket_idx" ON "ticket_history" USING btree ("ticket_id","created_at");