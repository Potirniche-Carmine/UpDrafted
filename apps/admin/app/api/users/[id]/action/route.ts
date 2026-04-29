import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-guard";
import { applyManagedUserAction } from "@/lib/users";

export const runtime = "nodejs";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("verify") }),
  z.object({ action: z.literal("unverify") }),
  z.object({ action: z.literal("unban") }),
  z.object({
    action: z.literal("ban_permanent"),
    reason: z.string().trim().min(1).max(4000),
  }),
  z.object({
    action: z.literal("ban_temporary"),
    reason: z.string().trim().min(1).max(4000),
    durationDays: z.number().int().positive().max(3650),
  }),
]);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  if (!id.trim()) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const input = schema.safeParse(body);
  if (!input.success) {
    return NextResponse.json({ error: "Invalid payload", issues: input.error.issues }, { status: 400 });
  }

  try {
    const user = await applyManagedUserAction(session, id, input.data);
    return NextResponse.json(user);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Action failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
