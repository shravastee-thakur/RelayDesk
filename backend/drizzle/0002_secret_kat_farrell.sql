ALTER TYPE "public"."ticket_status" ADD VALUE 'CANCELLED';--> statement-breakpoint
ALTER TABLE "tickets" ALTER COLUMN "priority" SET DEFAULT 'MEDIUM';--> statement-breakpoint
CREATE INDEX "agent_status_idx" ON "tickets" USING btree ("agent_id");