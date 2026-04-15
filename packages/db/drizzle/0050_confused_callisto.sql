ALTER TABLE "athlete_profiles" ADD COLUMN "school_id" integer;--> statement-breakpoint
ALTER TABLE "coach_profiles" ADD COLUMN "school_id" integer;--> statement-breakpoint
ALTER TABLE "recruiting_profiles" ADD COLUMN "school_id" integer;--> statement-breakpoint
ALTER TABLE "athlete_profiles" ADD CONSTRAINT "athlete_profiles_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coach_profiles" ADD CONSTRAINT "coach_profiles_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recruiting_profiles" ADD CONSTRAINT "recruiting_profiles_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_athlete_profiles_school_id" ON "athlete_profiles" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "idx_coach_profiles_school_id" ON "coach_profiles" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "idx_recruiting_profiles_school_id" ON "recruiting_profiles" USING btree ("school_id");