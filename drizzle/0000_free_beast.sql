CREATE TYPE "public"."coach_role" AS ENUM('coach', 'recruiter');--> statement-breakpoint
CREATE TYPE "public"."connection_status" AS ENUM('connected', 'interested', 'viewed');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'coed');--> statement-breakpoint
CREATE TYPE "public"."initiated_by" AS ENUM('athlete', 'coach');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('athlete', 'coach', 'recruiter');--> statement-breakpoint
CREATE TYPE "public"."verification_status" AS ENUM('pending', 'verified', 'rejected');--> statement-breakpoint
CREATE TABLE "activity_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"viewer_id" text NOT NULL,
	"viewed_user_id" text NOT NULL,
	"action" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
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
	"high_school" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"height" text NOT NULL,
	"weight" text NOT NULL,
	"positions" text[] NOT NULL,
	"gpa" numeric(3, 2),
	"sat_score" integer,
	"act_score" integer,
	"intended_major" text,
	"gender" text,
	"maxpreps_url" text NOT NULL,
	"verification_status" "verification_status" DEFAULT 'pending' NOT NULL,
	"hudl_url" text,
	"hudl_embed_url" text,
	"instagram_handle" text,
	"twitter_handle" text,
	"personal_statement" text,
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
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coach_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"role" "coach_role" NOT NULL,
	"sports_coaching" text[] NOT NULL,
	"organization_name" text NOT NULL,
	"organization_logo" text,
	"division" text NOT NULL,
	"conference" text,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"is_verified" boolean DEFAULT false,
	"program_website" text,
	"school_website" text,
	"instagram_handle" text,
	"twitter_handle" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "coach_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "connections" (
	"id" serial PRIMARY KEY NOT NULL,
	"athlete_id" integer NOT NULL,
	"coach_id" integer NOT NULL,
	"status" "connection_status" DEFAULT 'viewed' NOT NULL,
	"initiated_by" "initiated_by" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "connections_athlete_coach_unique" UNIQUE("athlete_id","coach_id")
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"athlete_id" integer NOT NULL,
	"coach_id" integer NOT NULL,
	"last_message_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "conversations_athlete_coach_unique" UNIQUE("athlete_id","coach_id")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"sender_id" text NOT NULL,
	"content" text NOT NULL,
	"message_type" text DEFAULT 'text' NOT NULL,
	"attachment_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recruiting_needs" (
	"id" serial PRIMARY KEY NOT NULL,
	"coach_id" integer NOT NULL,
	"graduation_years" integer[] NOT NULL,
	"positions" text[] NOT NULL,
	"scholarships_available" integer,
	"recruiting_philosophy" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "recruiting_needs_coach_id_unique" UNIQUE("coach_id")
);
--> statement-breakpoint
CREATE TABLE "sports" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"gender" "gender" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"role" "user_role" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_viewer_id_users_id_fk" FOREIGN KEY ("viewer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_viewed_user_id_users_id_fk" FOREIGN KEY ("viewed_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "athlete_measurables" ADD CONSTRAINT "athlete_measurables_athlete_id_athlete_profiles_id_fk" FOREIGN KEY ("athlete_id") REFERENCES "public"."athlete_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "athlete_profiles" ADD CONSTRAINT "athlete_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "athlete_videos" ADD CONSTRAINT "athlete_videos_athlete_id_athlete_profiles_id_fk" FOREIGN KEY ("athlete_id") REFERENCES "public"."athlete_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coach_profiles" ADD CONSTRAINT "coach_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_athlete_id_athlete_profiles_id_fk" FOREIGN KEY ("athlete_id") REFERENCES "public"."athlete_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_coach_id_coach_profiles_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."coach_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_athlete_id_athlete_profiles_id_fk" FOREIGN KEY ("athlete_id") REFERENCES "public"."athlete_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_coach_id_coach_profiles_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."coach_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recruiting_needs" ADD CONSTRAINT "recruiting_needs_coach_id_coach_profiles_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."coach_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_activity_log_viewer_id" ON "activity_log" USING btree ("viewer_id");--> statement-breakpoint
CREATE INDEX "idx_activity_log_viewed_user_id" ON "activity_log" USING btree ("viewed_user_id");--> statement-breakpoint
CREATE INDEX "idx_activity_log_created_at" ON "activity_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_athlete_profiles_user_id" ON "athlete_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_athlete_profiles_sport" ON "athlete_profiles" USING btree ("sport");--> statement-breakpoint
CREATE INDEX "idx_athlete_profiles_graduation_year" ON "athlete_profiles" USING btree ("graduation_year");--> statement-breakpoint
CREATE INDEX "idx_coach_profiles_user_id" ON "coach_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_coach_profiles_role" ON "coach_profiles" USING btree ("role");--> statement-breakpoint
CREATE INDEX "idx_connections_athlete_id" ON "connections" USING btree ("athlete_id");--> statement-breakpoint
CREATE INDEX "idx_connections_coach_id" ON "connections" USING btree ("coach_id");--> statement-breakpoint
CREATE INDEX "idx_conversations_athlete_id" ON "conversations" USING btree ("athlete_id");--> statement-breakpoint
CREATE INDEX "idx_conversations_coach_id" ON "conversations" USING btree ("coach_id");--> statement-breakpoint
CREATE INDEX "idx_conversations_last_message_at" ON "conversations" USING btree ("last_message_at");--> statement-breakpoint
CREATE INDEX "idx_messages_conversation_id" ON "messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "idx_messages_sender_id" ON "messages" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "idx_messages_created_at" ON "messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_sports_gender" ON "sports" USING btree ("gender");--> statement-breakpoint
CREATE INDEX "idx_sports_is_active" ON "sports" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_users_role" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");