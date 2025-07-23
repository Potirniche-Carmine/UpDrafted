DROP TABLE "conferences" CASCADE;--> statement-breakpoint
ALTER TABLE "athlete_profiles" ADD COLUMN "conference" text;--> statement-breakpoint
DROP TYPE "public"."division";