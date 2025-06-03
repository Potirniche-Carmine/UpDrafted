ALTER TABLE "recruiting_profile_needs" DROP CONSTRAINT "recruiting_profile_needs_recruiting_profile_id_unique";--> statement-breakpoint
ALTER TABLE "connections" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "recruiting_profile_needs" ADD COLUMN "main_sport" text NOT NULL;--> statement-breakpoint
ALTER TABLE "recruiting_profiles" ADD COLUMN "secondary_sports" text[];--> statement-breakpoint
CREATE INDEX "idx_recruiting_profile_needs_recruiting_profile_id" ON "recruiting_profile_needs" USING btree ("recruiting_profile_id");--> statement-breakpoint
CREATE INDEX "idx_recruiting_profile_needs_main_sport" ON "recruiting_profile_needs" USING btree ("main_sport");--> statement-breakpoint
ALTER TABLE "recruiting_profile_needs" ADD CONSTRAINT "recruiting_profile_needs_recruiting_profile_sport_unique" UNIQUE("recruiting_profile_id","main_sport");