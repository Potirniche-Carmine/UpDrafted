ALTER TABLE "athlete_profiles" ALTER COLUMN "school_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "coach_profiles" ALTER COLUMN "school_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "recruiting_profiles" ALTER COLUMN "school_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "athlete_profiles" DROP COLUMN "organization_name";--> statement-breakpoint
ALTER TABLE "coach_profiles" DROP COLUMN "organization_name";--> statement-breakpoint
ALTER TABLE "recruiting_profiles" DROP COLUMN "organization_name";