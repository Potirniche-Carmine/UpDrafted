CREATE TYPE "public"."verification_type" AS ENUM('general', 'transfer_portal');--> statement-breakpoint
ALTER TABLE "verification_requests" DROP CONSTRAINT "verification_requests_user_id_unique";--> statement-breakpoint
ALTER TABLE "athlete_profiles" ADD COLUMN "is_transfer_portal_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "athlete_profiles" ADD COLUMN "transfer_portal_verified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "verification_requests" ADD COLUMN "verification_type" "verification_type" DEFAULT 'general' NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_athlete_profiles_transfer_portal_verified" ON "athlete_profiles" USING btree ("is_transfer_portal_verified");--> statement-breakpoint
CREATE INDEX "idx_verification_requests_verification_type" ON "verification_requests" USING btree ("verification_type");--> statement-breakpoint
ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_user_id_verification_type_unique" UNIQUE("user_id","verification_type");