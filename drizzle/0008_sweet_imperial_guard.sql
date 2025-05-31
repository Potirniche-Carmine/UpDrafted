ALTER TABLE "athlete_videos" ADD COLUMN "sort_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_athlete_videos_athlete_id" ON "athlete_videos" USING btree ("athlete_id");--> statement-breakpoint
CREATE INDEX "idx_athlete_videos_sort_order" ON "athlete_videos" USING btree ("sort_order");