CREATE TABLE "profile_completion" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"user_type" "user_role" NOT NULL,
	"overall" integer NOT NULL,
	"basic_category" integer DEFAULT 0 NOT NULL,
	"academic_category" integer DEFAULT 0 NOT NULL,
	"athletic_category" integer DEFAULT 0 NOT NULL,
	"media_category" integer DEFAULT 0 NOT NULL,
	"social_category" integer DEFAULT 0 NOT NULL,
	"missing_fields" jsonb DEFAULT '[]' NOT NULL,
	"next_steps" jsonb DEFAULT '[]' NOT NULL,
	"last_calculated" timestamp with time zone DEFAULT now() NOT NULL,
	"profile_last_updated" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profile_completion_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "profile_completion" ADD CONSTRAINT "profile_completion_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_profile_completion_user_id" ON "profile_completion" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_profile_completion_user_type" ON "profile_completion" USING btree ("user_type");