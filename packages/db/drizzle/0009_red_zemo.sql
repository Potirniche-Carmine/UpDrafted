ALTER TABLE "verification_requests" ALTER COLUMN "verification_type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "verification_requests" ALTER COLUMN "verification_type" SET DEFAULT 'general'::text;--> statement-breakpoint
DROP TYPE "public"."verification_type";--> statement-breakpoint
CREATE TYPE "public"."verification_type" AS ENUM('general');--> statement-breakpoint
ALTER TABLE "verification_requests" ALTER COLUMN "verification_type" SET DEFAULT 'general'::"public"."verification_type";--> statement-breakpoint
ALTER TABLE "verification_requests" ALTER COLUMN "verification_type" SET DATA TYPE "public"."verification_type" USING "verification_type"::"public"."verification_type";--> statement-breakpoint
ALTER TABLE "athlete_profiles" DROP COLUMN "transfer_portal_verified_at";--> statement-breakpoint
ALTER TABLE "athlete_profiles" DROP COLUMN "is_on_transfer_portal";