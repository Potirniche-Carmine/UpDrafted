import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-guard";
import { listReports, type ReportStatusFilter } from "@/lib/reports";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUSES: readonly ReportStatusFilter[] = [
  "all",
  "pending",
  "under_review",
  "resolved",
  "dismissed",
];

export async function GET(request: NextRequest) {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const statusParam = request.nextUrl.searchParams.get("status") ?? "pending";
  const status = (STATUSES as readonly string[]).includes(statusParam)
    ? (statusParam as ReportStatusFilter)
    : "pending";

  const items = await listReports(session, status);
  return NextResponse.json({ items });
}
