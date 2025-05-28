CREATE TABLE "recruiting_profile_needs" (
	"id" serial PRIMARY KEY NOT NULL,
	"recruiting_profile_id" integer NOT NULL,
	"graduation_years" integer[] NOT NULL,
	"positions" text[] NOT NULL,
	"scholarships_available" integer,
	"recruiting_philosophy" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "recruiting_profile_needs_recruiting_profile_id_unique" UNIQUE("recruiting_profile_id")
);
--> statement-breakpoint
CREATE TABLE "recruiting_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"sport_recruiting" text NOT NULL,
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
	"showcase_video_title" text,
	"showcase_video_url" text,
	"showcase_video_embed_url" text,
	"recruiting_philosophy" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "recruiting_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "coach_profiles" RENAME COLUMN "sports_coaching" TO "sport_coaching";--> statement-breakpoint
ALTER TABLE "coach_profiles" ADD COLUMN "showcase_video_title" text;--> statement-breakpoint
ALTER TABLE "coach_profiles" ADD COLUMN "showcase_video_url" text;--> statement-breakpoint
ALTER TABLE "coach_profiles" ADD COLUMN "showcase_video_embed_url" text;--> statement-breakpoint
ALTER TABLE "recruiting_profile_needs" ADD CONSTRAINT "recruiting_profile_needs_recruiting_profile_id_recruiting_profiles_id_fk" FOREIGN KEY ("recruiting_profile_id") REFERENCES "public"."recruiting_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recruiting_profiles" ADD CONSTRAINT "recruiting_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_recruiting_profiles_user_id" ON "recruiting_profiles" USING btree ("user_id");