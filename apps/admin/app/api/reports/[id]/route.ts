import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-guard";
import { getReportDetail } from "@/lib/reports";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  const parsed = Number.parseInt(id, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const detail = await getReportDetail(session, parsed);
  if (!detail) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(detail);
}
