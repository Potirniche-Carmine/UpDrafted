import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-guard";
import { applyVerificationAction } from "@/lib/verifications";

export const runtime = "nodejs";

const schema = z.object({
  action: z.enum(["approve", "deny"]),
  reason: z.string().max(4000).optional(),
  moderatorNotes: z.string().max(4000).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  const parsed = Number.parseInt(id, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const input = schema.safeParse(body);
  if (!input.success) {
    return NextResponse.json({ error: "Invalid payload", issues: input.error.issues }, { status: 400 });
  }

  try {
    await applyVerificationAction(session, {
      requestId: parsed,
      action: input.data.action,
      reason: input.data.reason,
      moderatorNotes: input.data.moderatorNotes,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Action failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
