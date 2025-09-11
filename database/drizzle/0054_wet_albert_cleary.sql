CREATE TYPE "public"."subscription_status" AS ENUM('active', 'cancelled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired', 'unpaid');--> statement-breakpoint
CREATE TYPE "public"."subscription_tier" AS ENUM('free', 'pro_athlete_monthly', 'pro_athlete_yearly', 'pro_coach_monthly', 'pro_coach_yearly', 'pro_recruiter_monthly', 'pro_recruiter_yearly');--> statement-breakpoint
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
ALTER TABLE "athlete_profiles" ADD COLUMN "team_level" text;--> statement-breakpoint
ALTER TABLE "billing_events" ADD CONSTRAINT "billing_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_events" ADD CONSTRAINT "billing_events_subscription_id_user_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."user_subscriptions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_usage_tracking" ADD CONSTRAINT "user_usage_tracking_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_billing_events_user_id" ON "billing_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_billing_events_subscription_id" ON "billing_events" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "idx_billing_events_stripe_event_id" ON "billing_events" USING btree ("stripe_event_id");--> statement-breakpoint
CREATE INDEX "idx_billing_events_event_type" ON "billing_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "idx_billing_events_event_timestamp" ON "billing_events" USING btree ("event_timestamp");--> statement-breakpoint
CREATE INDEX "idx_subscription_feature_limits_tier" ON "subscription_feature_limits" USING btree ("tier");--> statement-breakpoint
CREATE INDEX "idx_user_subscriptions_user_id" ON "user_subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_subscriptions_stripe_customer_id" ON "user_subscriptions" USING btree ("stripe_customer_id");--> statement-breakpoint
CREATE INDEX "idx_user_subscriptions_stripe_subscription_id" ON "user_subscriptions" USING btree ("stripe_subscription_id");--> statement-breakpoint
CREATE INDEX "idx_user_subscriptions_status" ON "user_subscriptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_user_subscriptions_tier" ON "user_subscriptions" USING btree ("tier");--> statement-breakpoint
CREATE INDEX "idx_user_subscriptions_period_end" ON "user_subscriptions" USING btree ("current_period_end");--> statement-breakpoint
CREATE INDEX "idx_user_usage_user_id" ON "user_usage_tracking" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_usage_period_end" ON "user_usage_tracking" USING btree ("current_period_end");