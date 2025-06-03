ALTER TABLE "recruiting_profile_needs" RENAME COLUMN "main_sport" TO "sport";--> statement-breakpoint
ALTER TABLE "recruiting_profile_needs" DROP CONSTRAINT "recruiting_profile_needs_recruiting_profile_sport_unique";--> statement-breakpoint
DROP INDEX "idx_recruiting_profile_needs_main_sport";--> statement-breakpoint
ALTER TABLE "recruiting_profile_needs" ADD CONSTRAINT "recruiting_profile_needs_recruiting_profile_sport_unique" UNIQUE("recruiting_profile_id","sport");