ALTER TABLE "recruiting_profiles" RENAME COLUMN "recruiting_philosophy" TO "personal_statement";--> statement-breakpoint
DROP INDEX "idx_coach_profiles_role";--> statement-breakpoint
ALTER TABLE "coach_profiles" ADD COLUMN "personal_statement" text;--> statement-breakpoint
ALTER TABLE "coach_profiles" DROP COLUMN "role";