ALTER TABLE "athlete_profiles" RENAME COLUMN "high_school" TO "organization_name";--> statement-breakpoint
ALTER TABLE "coach_profiles" ADD COLUMN "full_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "recruiting_profiles" ADD COLUMN "full_name" text NOT NULL;