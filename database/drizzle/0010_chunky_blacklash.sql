CREATE INDEX "idx_activity_log_viewed_created" ON "activity_log" USING btree ("viewed_user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_activity_log_lookup" ON "activity_log" USING btree ("viewer_id","viewed_user_id","action");--> statement-breakpoint
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_unique_viewer_viewed_action" UNIQUE("viewer_id","viewed_user_id","action");