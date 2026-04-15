ALTER TABLE "conversations" ALTER COLUMN "user1_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "conversations" ALTER COLUMN "user2_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user1_id_users_id_fk" FOREIGN KEY ("user1_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user2_id_users_id_fk" FOREIGN KEY ("user2_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;