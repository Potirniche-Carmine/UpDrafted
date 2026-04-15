CREATE TABLE "athlete_experience" (
	"id" serial PRIMARY KEY NOT NULL,
	"athlete_id" integer NOT NULL,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"city" text NOT NULL,
	"state_country" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"sport" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "athlete_experience" ADD CONSTRAINT "athlete_experience_athlete_id_athlete_profiles_id_fk" FOREIGN KEY ("athlete_id") REFERENCES "public"."athlete_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_athlete_experience_athlete_id" ON "athlete_experience" USING btree ("athlete_id");--> statement-breakpoint
CREATE INDEX "idx_athlete_experience_type" ON "athlete_experience" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_athlete_experience_sport" ON "athlete_experience" USING btree ("sport");--> statement-breakpoint
CREATE INDEX "idx_athlete_experience_start_date" ON "athlete_experience" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX "idx_athlete_experience_end_date" ON "athlete_experience" USING btree ("end_date");--> statement-breakpoint
CREATE INDEX "idx_athlete_experience_dates" ON "athlete_experience" USING btree ("start_date","end_date");