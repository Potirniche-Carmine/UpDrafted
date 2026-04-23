import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-guard";
import { applyReportAction } from "@/lib/reports";

export const runtime = "nodejs";

const schema = z
  .object({
    action: z.enum(["ban_permanent", "ban_temporary", "decline"]),
    reason: z.string().max(4000).optional(),
    durationDays: z.number().int().positive().max(3650).optional(),
    moderatorNotes: z.string().max(4000).optional(),
  })
  .refine(
    (v) => (v.action === "ban_temporary" ? typeof v.durationDays === "number" : true),
    { message: "durationDays is required for ban_temporary", path: ["durationDays"] },
  );

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
    await applyReportAction(session, { reportId: parsed, ...input.data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Action failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
