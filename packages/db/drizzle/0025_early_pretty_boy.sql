ALTER TABLE "message_reads" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "message_reads" CASCADE;--> statement-breakpoint
ALTER TABLE "conversations" RENAME COLUMN "athlete_id" TO "user1_id";--> statement-breakpoint
ALTER TABLE "conversations" RENAME COLUMN "coach_id" TO "user2_id";--> statement-breakpoint
ALTER TABLE "messages" RENAME COLUMN "content" TO "encrypted_content";--> statement-breakpoint
ALTER TABLE "conversations" DROP CONSTRAINT "conversations_athlete_coach_unique";--> statement-breakpoint
ALTER TABLE "conversations" DROP CONSTRAINT "conversations_athlete_id_athlete_profiles_id_fk";
--> statement-breakpoint
ALTER TABLE "conversations" DROP CONSTRAINT "conversations_coach_id_coach_profiles_id_fk";
--> statement-breakpoint
DROP INDEX "idx_conversations_athlete_id";--> statement-breakpoint
DROP INDEX "idx_conversations_coach_id";--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "user1_unread_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "user2_unread_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "connection_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "content_iv" text NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "is_read" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "read_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user1_id_users_id_fk" FOREIGN KEY ("user1_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user2_id_users_id_fk" FOREIGN KEY ("user2_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_conversations_user1_id" ON "conversations" USING btree ("user1_id");--> statement-breakpoint
CREATE INDEX "idx_conversations_user2_id" ON "conversations" USING btree ("user2_id");--> statement-breakpoint
CREATE INDEX "idx_conversations_connection_active" ON "conversations" USING btree ("connection_active");--> statement-breakpoint
CREATE INDEX "idx_messages_is_read" ON "messages" USING btree ("is_read");--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_users_unique" UNIQUE("user1_id","user2_id");