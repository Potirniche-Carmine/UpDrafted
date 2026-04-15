CREATE INDEX "idx_connections_status" ON "connections" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_connections_from_status" ON "connections" USING btree ("from_user_id","status");--> statement-breakpoint
CREATE INDEX "idx_connections_to_status" ON "connections" USING btree ("to_user_id","status");--> statement-breakpoint
CREATE INDEX "idx_conversations_user1_lastmessage" ON "conversations" USING btree ("user1_id","last_message_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_conversations_user2_lastmessage" ON "conversations" USING btree ("user2_id","last_message_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_messages_conversation_created" ON "messages" USING btree ("conversation_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_messages_sender_read" ON "messages" USING btree ("sender_id","is_read");--> statement-breakpoint
CREATE INDEX "idx_messages_conversation_read" ON "messages" USING btree ("conversation_id","is_read");