ALTER TYPE "public"."user_role" ADD VALUE 'admin';--> statement-breakpoint
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
ALTER TABLE "athlete_profiles" ADD COLUMN "is_demo_profile" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "coach_profiles" ADD COLUMN "is_demo_profile" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "recruiting_profiles" ADD COLUMN "is_demo_profile" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "admin_role_preferences" ADD CONSTRAINT "admin_role_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_admin_role_preferences_user_id" ON "admin_role_preferences" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_athlete_profiles_is_demo" ON "athlete_profiles" USING btree ("is_demo_profile");--> statement-breakpoint
CREATE INDEX "idx_coach_profiles_is_demo" ON "coach_profiles" USING btree ("is_demo_profile");--> statement-breakpoint
CREATE INDEX "idx_recruiting_profiles_is_demo" ON "recruiting_profiles" USING btree ("is_demo_profile");