ALTER TYPE "public"."verification_type" ADD VALUE 'transfer_portal';--> statement-breakpoint
ALTER POLICY "connections_insert_policy" ON "connections" TO public WITH CHECK ("connections"."from_user_id" = current_setting('app.current_user_id') AND NOT EXISTS (
      SELECT 1
      FROM athlete_profiles ap
      WHERE ap.user_id IN ("connections"."from_user_id", "connections"."to_user_id")
        AND ap.division IN ('NCAA Division I', 'NCAA Division II')
        AND NOT EXISTS (
          SELECT 1
          FROM verification_requests vr
          WHERE vr.user_id = ap.user_id
            AND vr.verification_type = 'transfer_portal'
            AND vr.status = 'approved'
        )
    ));--> statement-breakpoint
ALTER POLICY "messages_insert_policy" ON "messages" TO public WITH CHECK ("messages"."sender_id" = current_setting('app.current_user_id') AND NOT EXISTS (
      SELECT 1
      FROM conversations c
      JOIN athlete_profiles ap ON ap.user_id IN (c.user1_id, c.user2_id)
      WHERE c.id = "messages"."conversation_id"
        AND ap.division IN ('NCAA Division I', 'NCAA Division II')
        AND NOT EXISTS (
          SELECT 1
          FROM verification_requests vr
          WHERE vr.user_id = ap.user_id
            AND vr.verification_type = 'transfer_portal'
            AND vr.status = 'approved'
        )
    ));