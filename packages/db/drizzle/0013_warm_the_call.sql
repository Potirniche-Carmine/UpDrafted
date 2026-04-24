ALTER TABLE "verification_requests" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "verification_requests" ALTER COLUMN "status" SET DEFAULT 'pending'::text;--> statement-breakpoint
DROP TYPE "public"."verification_request_status";--> statement-breakpoint
CREATE TYPE "public"."verification_request_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
ALTER TABLE "verification_requests" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."verification_request_status";--> statement-breakpoint
ALTER TABLE "verification_requests" ALTER COLUMN "status" SET DATA TYPE "public"."verification_request_status" USING "status"::"public"."verification_request_status";--> statement-breakpoint
CREATE INDEX "idx_reports_status_submitted_at" ON "reports" USING btree ("status","submitted_at");--> statement-breakpoint
CREATE INDEX "idx_verification_requests_status_submitted_at" ON "verification_requests" USING btree ("status","submitted_at");