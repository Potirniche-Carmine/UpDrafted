ALTER TABLE "connections" DROP CONSTRAINT "connections_athlete_coach_unique";--> statement-breakpoint
ALTER TABLE "connections" DROP CONSTRAINT "connections_athlete_id_athlete_profiles_id_fk";
--> statement-breakpoint
ALTER TABLE "connections" DROP CONSTRAINT "connections_coach_id_coach_profiles_id_fk";
--> statement-breakpoint
DROP INDEX "idx_connections_athlete_id";--> statement-breakpoint
DROP INDEX "idx_connections_coach_id";--> statement-breakpoint
ALTER TABLE "connections" ADD COLUMN "from_user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "connections" ADD COLUMN "to_user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_from_user_id_users_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_to_user_id_users_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_connections_from_user_id" ON "connections" USING btree ("from_user_id");--> statement-breakpoint
CREATE INDEX "idx_connections_to_user_id" ON "connections" USING btree ("to_user_id");--> statement-breakpoint
ALTER TABLE "connections" DROP COLUMN "athlete_id";--> statement-breakpoint
ALTER TABLE "connections" DROP COLUMN "coach_id";--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_users_unique" UNIQUE("from_user_id","to_user_id");