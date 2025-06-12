ALTER TABLE "notifications" ADD COLUMN "dismissed_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "idx_notifications_dismissed_at" ON "notifications" USING btree ("dismissed_at");