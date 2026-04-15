CREATE TYPE "public"."coach_role" AS ENUM('coach', 'recruiter');--> statement-breakpoint
CREATE TYPE "public"."connection_status" AS ENUM('connected', 'pending');--> statement-breakpoint
CREATE TYPE "public"."education_level" AS ENUM('high_school', 'undergraduate', 'graduate', 'associate');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'coed');--> statement-breakpoint
CREATE TYPE "public"."initiated_by" AS ENUM('athlete', 'coach', 'recruiter');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('profileView', 'newConnection', 'newMessage', 'systemUpdate', 'premiumFeature', 'connectionAccepted');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('pending', 'under_review', 'resolved', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."school_classification" AS ENUM('high_school', 'college', 'university', 'professional', 'other');--> statement-breakpoint
CREATE TYPE "public"."student_classification" AS ENUM('high_school', 'university_transfers', 'juco_students', 'graduate_transfers', 'international_students');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'cancelled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired', 'unpaid');--> statement-breakpoint
CREATE TYPE "public"."subscription_tier" AS ENUM('free', 'pro_athlete_monthly', 'pro_athlete_yearly', 'pro_coach_monthly', 'pro_coach_yearly', 'pro_recruiter_monthly', 'pro_recruiter_yearly');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('athlete', 'coach', 'recruiter', 'admin');--> statement-breakpoint
CREATE TYPE "public"."verification_request_status" AS ENUM('pending', 'approved', 'rejected', 'under_review');--> statement-breakpoint
CREATE TYPE "public"."verification_type" AS ENUM('general', 'transfer_portal');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"id_token" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activity_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"viewer_id" text NOT NULL,
	"viewed_user_id" text NOT NULL,
	"action" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_role_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"current_viewing_role" "user_role",
	"verification_status_override" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_role_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "athlete_experience" (
	"id" serial PRIMARY KEY NOT NULL,
	"athlete_id" integer NOT NULL,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"city" text NOT NULL,
	"country" text NOT NULL,
	"state" text,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"sport" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "athlete_measurables" (
	"id" serial PRIMARY KEY NOT NULL,
	"athlete_id" integer NOT NULL,
	"sport" text NOT NULL,
	"label" text NOT NULL,
	"value" text NOT NULL,
	"measurement_date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "athlete_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"full_name" text NOT NULL,
	"profile_image_r3_key" text,
	"sport" text NOT NULL,
	"secondary_sports" text[],
	"graduation_year" integer NOT NULL,
	"division" text,
	"conference" text,
	"education_level" "education_level" DEFAULT 'high_school' NOT NULL,
	"school_id" integer NOT NULL,
	"city" text NOT NULL,
	"country" text DEFAULT 'United States' NOT NULL,
	"state" text,
	"height" text NOT NULL,
	"weight" text NOT NULL,
	"positions" text[] NOT NULL,
	"team_level" text,
	"gpa" real,
	"sat_score" integer,
	"act_score" integer,
	"intended_major" text,
	"gender" text,
	"maxpreps_url" text,
	"sports247_url" text,
	"espn_url" text,
	"is_verified" boolean DEFAULT false,
	"transfer_portal_verified_at" timestamp with time zone,
	"is_on_transfer_portal" boolean DEFAULT false,
	"hudl_url" text,
	"hudl_embed_url" text,
	"instagram_handle" text,
	"twitter_handle" text,
	"personal_statement" text,
	"is_demo_profile" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "athlete_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "athlete_videos" (
	"id" serial PRIMARY KEY NOT NULL,
	"athlete_id" integer NOT NULL,
	"title" text NOT NULL,
	"youtube_url" text NOT NULL,
	"embed_url" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "billing_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"subscription_id" integer,
	"stripe_event_id" text,
	"stripe_invoice_id" text,
	"stripe_payment_intent_id" text,
	"event_type" text NOT NULL,
	"amount" integer,
	"currency" text DEFAULT 'usd',
	"status" text NOT NULL,
	"event_data" jsonb,
	"event_timestamp" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "billing_events_stripe_event_id_unique" UNIQUE("stripe_event_id")
);
--> statement-breakpoint
CREATE TABLE "coach_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"full_name" text NOT NULL,
	"title" text NOT NULL,
	"sport_coaching" text NOT NULL,
	"school_id" integer NOT NULL,
	"profile_image_r3_key" text,
	"organization_logo_r3_key" text,
	"division" text NOT NULL,
	"conference" text,
	"city" text NOT NULL,
	"country" text DEFAULT 'United States' NOT NULL,
	"state" text,
	"is_verified" boolean DEFAULT false,
	"program_website" text,
	"school_website" text,
	"instagram_handle" text,
	"twitter_handle" text,
	"program_instagram" text,
	"program_twitter" text,
	"showcase_video_title" text,
	"showcase_video_url" text,
	"personal_statement" text,
	"showcase_video_embed_url" text,
	"is_demo_profile" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "coach_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "connections" (
	"id" serial PRIMARY KEY NOT NULL,
	"from_user_id" text NOT NULL,
	"to_user_id" text NOT NULL,
	"status" "connection_status" DEFAULT 'pending' NOT NULL,
	"notes" text,
	"initiated_by" "initiated_by" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "connections_users_unique" UNIQUE("from_user_id","to_user_id")
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user1_id" text NOT NULL,
	"user2_id" text NOT NULL,
	"last_message_at" timestamp with time zone,
	"user1_unread_count" integer DEFAULT 0 NOT NULL,
	"user2_unread_count" integer DEFAULT 0 NOT NULL,
	"connection_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "conversations_users_unique" UNIQUE("user1_id","user2_id")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"sender_id" text NOT NULL,
	"encrypted_content" text NOT NULL,
	"content_iv" text NOT NULL,
	"message_type" text DEFAULT 'text' NOT NULL,
	"attachment_url" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"read_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "recruiting_needs" (
	"id" serial PRIMARY KEY NOT NULL,
	"coach_id" integer NOT NULL,
	"student_classifications" "student_classification"[] NOT NULL,
	"positions" text[] NOT NULL,
	"scholarships_available" integer,
	"recruiting_philosophy" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "recruiting_needs_coach_id_unique" UNIQUE("coach_id")
);
--> statement-breakpoint
CREATE TABLE "recruiting_profile_needs" (
	"id" serial PRIMARY KEY NOT NULL,
	"recruiting_profile_id" integer NOT NULL,
	"sport" text NOT NULL,
	"student_classifications" "student_classification"[] NOT NULL,
	"positions" text[] NOT NULL,
	"scholarships_available" integer,
	"recruiting_philosophy" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "recruiting_profile_needs_recruiting_profile_sport_unique" UNIQUE("recruiting_profile_id","sport")
);
--> statement-breakpoint
CREATE TABLE "recruiting_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"full_name" text NOT NULL,
	"title" text NOT NULL,
	"sport_recruiting" text NOT NULL,
	"secondary_sports" text[],
	"school_id" integer NOT NULL,
	"profile_image_r3_key" text,
	"organization_logo_r3_key" text,
	"division" text NOT NULL,
	"conference" text,
	"city" text NOT NULL,
	"country" text DEFAULT 'United States' NOT NULL,
	"state" text,
	"is_verified" boolean DEFAULT false,
	"program_website" text,
	"school_website" text,
	"instagram_handle" text,
	"twitter_handle" text,
	"program_instagram" text,
	"program_twitter" text,
	"showcase_video_title" text,
	"showcase_video_url" text,
	"showcase_video_embed_url" text,
	"personal_statement" text,
	"is_demo_profile" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "recruiting_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"reporter_id" text NOT NULL,
	"reported_user_id" text NOT NULL,
	"report_reason" text NOT NULL,
	"additional_details" text,
	"status" "report_status" DEFAULT 'pending' NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewed_at" timestamp with time zone,
	"reviewed_by" text,
	"moderator_notes" text,
	"action_taken" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schools" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"classification" "school_classification" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "subscription" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"stripe_subscription_id" text,
	"stripe_customer_id" text,
	"plan" text,
	"status" text,
	"reference_id" text,
	"period_start" timestamp with time zone,
	"period_end" timestamp with time zone,
	"cancel_at_period_end" boolean,
	"seats" integer,
	"trial_start" timestamp with time zone,
	"trial_end" timestamp with time zone,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription_feature_limits" (
	"id" serial PRIMARY KEY NOT NULL,
	"tier" "subscription_tier" NOT NULL,
	"max_connections_per_month" integer DEFAULT -1,
	"max_active_connections" integer DEFAULT -1,
	"max_searches_per_day" integer DEFAULT -1,
	"advanced_search_enabled" boolean DEFAULT false,
	"analytics_enabled" boolean DEFAULT false,
	"profile_view_insights" boolean DEFAULT false,
	"activity_tracking" boolean DEFAULT false,
	"priority_profile_ranking" boolean DEFAULT false,
	"custom_profile_themes" boolean DEFAULT false,
	"video_uploads_enabled" boolean DEFAULT true,
	"max_video_uploads" integer DEFAULT 3,
	"priority_messaging" boolean DEFAULT false,
	"message_requests_enabled" boolean DEFAULT true,
	"priority_support" boolean DEFAULT false,
	"data_export_enabled" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscription_feature_limits_tier_unique" UNIQUE("tier")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" "user_role",
	"stripe_customer_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "user_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"stripe_price_id" text,
	"tier" "subscription_tier" DEFAULT 'free' NOT NULL,
	"status" "subscription_status" DEFAULT 'active' NOT NULL,
	"current_period_start" timestamp with time zone,
	"current_period_end" timestamp with time zone,
	"cancel_at_period_end" boolean DEFAULT false,
	"canceled_at" timestamp with time zone,
	"trial_start" timestamp with time zone,
	"trial_end" timestamp with time zone,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_subscriptions_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "user_subscriptions_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id")
);
--> statement-breakpoint
CREATE TABLE "user_usage_tracking" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"profile_views_received" integer DEFAULT 0,
	"connections_requested" integer DEFAULT 0,
	"messages_received" integer DEFAULT 0,
	"searches_performed" integer DEFAULT 0,
	"analytics_views" integer DEFAULT 0,
	"last_reset_at" timestamp with time zone DEFAULT now() NOT NULL,
	"current_period_start" timestamp with time zone DEFAULT now() NOT NULL,
	"current_period_end" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_usage_tracking_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "verification_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"verification_request_id" integer NOT NULL,
	"file_name" text NOT NULL,
	"file_type" text NOT NULL,
	"file_url" text,
	"r2_key" text,
	"link_url" text,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"role" "user_role" NOT NULL,
	"verification_type" "verification_type" DEFAULT 'general' NOT NULL,
	"status" "verification_request_status" DEFAULT 'pending' NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewed_at" timestamp with time zone,
	"reviewed_by" text,
	"rejection_reason" text,
	"moderator_notes" text,
	"additional_info" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "verification_requests_user_id_verification_type_unique" UNIQUE("user_id","verification_type")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_viewer_id_user_id_fk" FOREIGN KEY ("viewer_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_viewed_user_id_user_id_fk" FOREIGN KEY ("viewed_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_role_preferences" ADD CONSTRAINT "admin_role_preferences_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "athlete_experience" ADD CONSTRAINT "athlete_experience_athlete_id_athlete_profiles_id_fk" FOREIGN KEY ("athlete_id") REFERENCES "public"."athlete_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "athlete_measurables" ADD CONSTRAINT "athlete_measurables_athlete_id_athlete_profiles_id_fk" FOREIGN KEY ("athlete_id") REFERENCES "public"."athlete_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "athlete_profiles" ADD CONSTRAINT "athlete_profiles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "athlete_profiles" ADD CONSTRAINT "athlete_profiles_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "athlete_videos" ADD CONSTRAINT "athlete_videos_athlete_id_athlete_profiles_id_fk" FOREIGN KEY ("athlete_id") REFERENCES "public"."athlete_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_events" ADD CONSTRAINT "billing_events_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_events" ADD CONSTRAINT "billing_events_subscription_id_user_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."user_subscriptions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coach_profiles" ADD CONSTRAINT "coach_profiles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coach_profiles" ADD CONSTRAINT "coach_profiles_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_from_user_id_user_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_to_user_id_user_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user1_id_user_id_fk" FOREIGN KEY ("user1_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user2_id_user_id_fk" FOREIGN KEY ("user2_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recruiting_needs" ADD CONSTRAINT "recruiting_needs_coach_id_coach_profiles_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."coach_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recruiting_profile_needs" ADD CONSTRAINT "recruiting_profile_needs_recruiting_profile_id_recruiting_profiles_id_fk" FOREIGN KEY ("recruiting_profile_id") REFERENCES "public"."recruiting_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recruiting_profiles" ADD CONSTRAINT "recruiting_profiles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recruiting_profiles" ADD CONSTRAINT "recruiting_profiles_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_user_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reported_user_id_user_id_fk" FOREIGN KEY ("reported_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_usage_tracking" ADD CONSTRAINT "user_usage_tracking_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_files" ADD CONSTRAINT "verification_files_verification_request_id_verification_requests_id_fk" FOREIGN KEY ("verification_request_id") REFERENCES "public"."verification_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_account_user_id" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_activity_log_viewer_id" ON "activity_log" USING btree ("viewer_id");--> statement-breakpoint
CREATE INDEX "idx_activity_log_viewed_user_id" ON "activity_log" USING btree ("viewed_user_id");--> statement-breakpoint
CREATE INDEX "idx_activity_log_created_at" ON "activity_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_admin_role_preferences_user_id" ON "admin_role_preferences" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_athlete_experience_athlete_id" ON "athlete_experience" USING btree ("athlete_id");--> statement-breakpoint
CREATE INDEX "idx_athlete_experience_type" ON "athlete_experience" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_athlete_experience_sport" ON "athlete_experience" USING btree ("sport");--> statement-breakpoint
CREATE INDEX "idx_athlete_experience_start_date" ON "athlete_experience" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX "idx_athlete_experience_end_date" ON "athlete_experience" USING btree ("end_date");--> statement-breakpoint
CREATE INDEX "idx_athlete_experience_dates" ON "athlete_experience" USING btree ("start_date","end_date");--> statement-breakpoint
CREATE INDEX "idx_athlete_profiles_user_id" ON "athlete_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_athlete_profiles_sport" ON "athlete_profiles" USING btree ("sport");--> statement-breakpoint
CREATE INDEX "idx_athlete_profiles_graduation_year" ON "athlete_profiles" USING btree ("graduation_year");--> statement-breakpoint
CREATE INDEX "idx_athlete_profiles_education_level" ON "athlete_profiles" USING btree ("education_level");--> statement-breakpoint
CREATE INDEX "idx_athlete_profiles_school_id" ON "athlete_profiles" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "idx_athlete_profiles_is_demo" ON "athlete_profiles" USING btree ("is_demo_profile");--> statement-breakpoint
CREATE INDEX "idx_athlete_videos_athlete_id" ON "athlete_videos" USING btree ("athlete_id");--> statement-breakpoint
CREATE INDEX "idx_athlete_videos_sort_order" ON "athlete_videos" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "idx_billing_events_user_id" ON "billing_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_billing_events_subscription_id" ON "billing_events" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "idx_billing_events_stripe_event_id" ON "billing_events" USING btree ("stripe_event_id");--> statement-breakpoint
CREATE INDEX "idx_billing_events_event_type" ON "billing_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "idx_billing_events_event_timestamp" ON "billing_events" USING btree ("event_timestamp");--> statement-breakpoint
CREATE INDEX "idx_coach_profiles_user_id" ON "coach_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_coach_profiles_school_id" ON "coach_profiles" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "idx_coach_profiles_is_demo" ON "coach_profiles" USING btree ("is_demo_profile");--> statement-breakpoint
CREATE INDEX "idx_connections_from_user_id" ON "connections" USING btree ("from_user_id");--> statement-breakpoint
CREATE INDEX "idx_connections_to_user_id" ON "connections" USING btree ("to_user_id");--> statement-breakpoint
CREATE INDEX "idx_connections_status" ON "connections" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_connections_from_status" ON "connections" USING btree ("from_user_id","status");--> statement-breakpoint
CREATE INDEX "idx_connections_to_status" ON "connections" USING btree ("to_user_id","status");--> statement-breakpoint
CREATE INDEX "idx_conversations_user1_id" ON "conversations" USING btree ("user1_id");--> statement-breakpoint
CREATE INDEX "idx_conversations_user2_id" ON "conversations" USING btree ("user2_id");--> statement-breakpoint
CREATE INDEX "idx_conversations_last_message_at" ON "conversations" USING btree ("last_message_at");--> statement-breakpoint
CREATE INDEX "idx_conversations_connection_active" ON "conversations" USING btree ("connection_active");--> statement-breakpoint
CREATE INDEX "idx_conversations_user1_lastmessage" ON "conversations" USING btree ("user1_id","last_message_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_conversations_user2_lastmessage" ON "conversations" USING btree ("user2_id","last_message_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_messages_conversation_id" ON "messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "idx_messages_sender_id" ON "messages" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "idx_messages_created_at" ON "messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_messages_is_read" ON "messages" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX "idx_messages_conversation_created" ON "messages" USING btree ("conversation_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_messages_sender_read" ON "messages" USING btree ("sender_id","is_read");--> statement-breakpoint
CREATE INDEX "idx_messages_conversation_read" ON "messages" USING btree ("conversation_id","is_read");--> statement-breakpoint
CREATE INDEX "idx_notifications_user_id" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_notifications_is_read" ON "notifications" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX "idx_notifications_type" ON "notifications" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_notifications_created_at" ON "notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_notifications_user_unread" ON "notifications" USING btree ("user_id","is_read","created_at");--> statement-breakpoint
CREATE INDEX "idx_recruiting_profile_needs_recruiting_profile_id" ON "recruiting_profile_needs" USING btree ("recruiting_profile_id");--> statement-breakpoint
CREATE INDEX "idx_recruiting_profiles_user_id" ON "recruiting_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_recruiting_profiles_school_id" ON "recruiting_profiles" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "idx_recruiting_profiles_is_demo" ON "recruiting_profiles" USING btree ("is_demo_profile");--> statement-breakpoint
CREATE INDEX "idx_reports_reporter_id" ON "reports" USING btree ("reporter_id");--> statement-breakpoint
CREATE INDEX "idx_reports_reported_user_id" ON "reports" USING btree ("reported_user_id");--> statement-breakpoint
CREATE INDEX "idx_reports_status" ON "reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_reports_submitted_at" ON "reports" USING btree ("submitted_at");--> statement-breakpoint
CREATE INDEX "idx_schools_name" ON "schools" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_schools_classification" ON "schools" USING btree ("classification");--> statement-breakpoint
CREATE INDEX "idx_schools_name_lower" ON "schools" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_schools_classification_name" ON "schools" USING btree ("classification","name");--> statement-breakpoint
CREATE INDEX "idx_session_user_id" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_session_token" ON "session" USING btree ("token");--> statement-breakpoint
CREATE INDEX "idx_subscription_user_id" ON "subscription" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_subscription_stripe_id" ON "subscription" USING btree ("stripe_subscription_id");--> statement-breakpoint
CREATE INDEX "idx_subscription_feature_limits_tier" ON "subscription_feature_limits" USING btree ("tier");--> statement-breakpoint
CREATE INDEX "idx_user_role" ON "user" USING btree ("role");--> statement-breakpoint
CREATE INDEX "idx_user_email" ON "user" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_user_stripe_customer" ON "user" USING btree ("stripe_customer_id");--> statement-breakpoint
CREATE INDEX "idx_user_subscriptions_user_id" ON "user_subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_subscriptions_stripe_customer_id" ON "user_subscriptions" USING btree ("stripe_customer_id");--> statement-breakpoint
CREATE INDEX "idx_user_subscriptions_stripe_subscription_id" ON "user_subscriptions" USING btree ("stripe_subscription_id");--> statement-breakpoint
CREATE INDEX "idx_user_subscriptions_status" ON "user_subscriptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_user_subscriptions_tier" ON "user_subscriptions" USING btree ("tier");--> statement-breakpoint
CREATE INDEX "idx_user_subscriptions_period_end" ON "user_subscriptions" USING btree ("current_period_end");--> statement-breakpoint
CREATE INDEX "idx_user_usage_user_id" ON "user_usage_tracking" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_usage_period_end" ON "user_usage_tracking" USING btree ("current_period_end");--> statement-breakpoint
CREATE INDEX "idx_verification_identifier" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "idx_verification_files_verification_request_id" ON "verification_files" USING btree ("verification_request_id");--> statement-breakpoint
CREATE INDEX "idx_verification_requests_user_id" ON "verification_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_verification_requests_status" ON "verification_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_verification_requests_submitted_at" ON "verification_requests" USING btree ("submitted_at");--> statement-breakpoint
CREATE INDEX "idx_verification_requests_verification_type" ON "verification_requests" USING btree ("verification_type");