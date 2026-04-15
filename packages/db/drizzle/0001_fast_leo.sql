ALTER TABLE "connections" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "reports" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_subscriptions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "verification_requests" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "connections_read_policy" ON "connections" AS PERMISSIVE FOR SELECT TO public USING ("connections"."from_user_id" = current_setting('app.current_user_id') OR "connections"."to_user_id" = current_setting('app.current_user_id') OR current_setting('app.current_user_role') = 'admin');--> statement-breakpoint
CREATE POLICY "connections_insert_policy" ON "connections" AS PERMISSIVE FOR INSERT TO public WITH CHECK ("connections"."from_user_id" = current_setting('app.current_user_id'));--> statement-breakpoint
CREATE POLICY "messages_read_policy" ON "messages" AS PERMISSIVE FOR SELECT TO public USING ("messages"."sender_id" = current_setting('app.current_user_id') OR 
      EXISTS (
        SELECT 1 FROM conversations c 
        WHERE c.id = "messages"."conversation_id" 
        AND (c.user1_id = current_setting('app.current_user_id') OR c.user2_id = current_setting('app.current_user_id'))
      ) OR current_setting('app.current_user_role') = 'admin');--> statement-breakpoint
CREATE POLICY "messages_insert_policy" ON "messages" AS PERMISSIVE FOR INSERT TO public WITH CHECK ("messages"."sender_id" = current_setting('app.current_user_id'));--> statement-breakpoint
CREATE POLICY "notifications_read_policy" ON "notifications" AS PERMISSIVE FOR SELECT TO public USING ("notifications"."user_id" = current_setting('app.current_user_id') OR current_setting('app.current_user_role') = 'admin');--> statement-breakpoint
CREATE POLICY "reports_read_policy" ON "reports" AS PERMISSIVE FOR SELECT TO public USING (current_setting('app.current_user_role') = 'admin');--> statement-breakpoint
CREATE POLICY "reports_insert_policy" ON "reports" AS PERMISSIVE FOR INSERT TO public WITH CHECK ("reports"."reporter_id" = current_setting('app.current_user_id'));--> statement-breakpoint
CREATE POLICY "user_subscriptions_read_policy" ON "user_subscriptions" AS PERMISSIVE FOR SELECT TO public USING ("user_subscriptions"."user_id" = current_setting('app.current_user_id') OR current_setting('app.current_user_role') = 'admin');--> statement-breakpoint
CREATE POLICY "verification_requests_read_policy" ON "verification_requests" AS PERMISSIVE FOR SELECT TO public USING ("verification_requests"."user_id" = current_setting('app.current_user_id') OR current_setting('app.current_user_role') = 'admin');--> statement-breakpoint
CREATE POLICY "verification_requests_insert_policy" ON "verification_requests" AS PERMISSIVE FOR INSERT TO public WITH CHECK ("verification_requests"."user_id" = current_setting('app.current_user_id'));