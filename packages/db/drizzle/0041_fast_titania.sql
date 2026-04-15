ALTER TABLE "athlete_profiles" ALTER COLUMN "state" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "coach_profiles" ALTER COLUMN "state" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "recruiting_profiles" ALTER COLUMN "state" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "athlete_profiles" ADD COLUMN "country" text NOT NULL;--> statement-breakpoint
ALTER TABLE "coach_profiles" ADD COLUMN "country" text NOT NULL;--> statement-breakpoint
ALTER TABLE "recruiting_profiles" ADD COLUMN "country" text NOT NULL;