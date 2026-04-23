CREATE TABLE "report_moderator_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_id" integer NOT NULL,
	"moderator_id" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "report_moderator_comments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "verification_moderator_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"verification_request_id" integer NOT NULL,
	"moderator_id" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "verification_moderator_comments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "banned" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "banned_until" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "banned_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "banned_by" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "ban_reason" text;--> statement-breakpoint
ALTER TABLE "report_moderator_comments" ADD CONSTRAINT "report_moderator_comments_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_moderator_comments" ADD CONSTRAINT "report_moderator_comments_moderator_id_user_id_fk" FOREIGN KEY ("moderator_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_moderator_comments" ADD CONSTRAINT "verification_moderator_comments_verification_request_id_verification_requests_id_fk" FOREIGN KEY ("verification_request_id") REFERENCES "public"."verification_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_moderator_comments" ADD CONSTRAINT "verification_moderator_comments_moderator_id_user_id_fk" FOREIGN KEY ("moderator_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_rmc_report_id" ON "report_moderator_comments" USING btree ("report_id");--> statement-breakpoint
CREATE INDEX "idx_rmc_moderator_id" ON "report_moderator_comments" USING btree ("moderator_id");--> statement-breakpoint
CREATE INDEX "idx_rmc_created_at" ON "report_moderator_comments" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_vmc_verification_request_id" ON "verification_moderator_comments" USING btree ("verification_request_id");--> statement-breakpoint
CREATE INDEX "idx_vmc_moderator_id" ON "verification_moderator_comments" USING btree ("moderator_id");--> statement-breakpoint
CREATE INDEX "idx_vmc_created_at" ON "verification_moderator_comments" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_user_banned" ON "user" USING btree ("banned");--> statement-breakpoint
CREATE POLICY "rmc_read_policy" ON "report_moderator_comments" AS PERMISSIVE FOR SELECT TO public USING (current_setting('app.current_user_role') = 'admin');--> statement-breakpoint
CREATE POLICY "rmc_insert_policy" ON "report_moderator_comments" AS PERMISSIVE FOR INSERT TO public WITH CHECK (current_setting('app.current_user_role') = 'admin' AND "report_moderator_comments"."moderator_id" = current_setting('app.current_user_id'));--> statement-breakpoint
CREATE POLICY "vmc_read_policy" ON "verification_moderator_comments" AS PERMISSIVE FOR SELECT TO public USING (current_setting('app.current_user_role') = 'admin');--> statement-breakpoint
CREATE POLICY "vmc_insert_policy" ON "verification_moderator_comments" AS PERMISSIVE FOR INSERT TO public WITH CHECK (current_setting('app.current_user_role') = 'admin' AND "verification_moderator_comments"."moderator_id" = current_setting('app.current_user_id'));