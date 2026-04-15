CREATE TYPE "public"."education_level" AS ENUM('high_school', 'undergraduate', 'graduate', 'associate');--> statement-breakpoint
ALTER TABLE "athlete_profiles" ADD COLUMN "education_level" "education_level" DEFAULT 'high_school' NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_athlete_profiles_education_level" ON "athlete_profiles" USING btree ("education_level");