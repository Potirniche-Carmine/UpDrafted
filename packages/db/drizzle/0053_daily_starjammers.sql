ALTER TABLE "athlete_experience" RENAME COLUMN "state_country" TO "country";--> statement-breakpoint
ALTER TABLE "athlete_experience" ADD COLUMN "state" text;