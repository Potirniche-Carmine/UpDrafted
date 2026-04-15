ALTER TABLE "conversations" DROP CONSTRAINT "conversations_user1_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "conversations" DROP CONSTRAINT "conversations_user2_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "conversations" ALTER COLUMN "user1_id" SET DATA TYPE varchar(191);--> statement-breakpoint
ALTER TABLE "conversations" ALTER COLUMN "user2_id" SET DATA TYPE varchar(191);