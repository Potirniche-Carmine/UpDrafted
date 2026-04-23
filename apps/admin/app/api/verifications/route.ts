import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-guard";
import { listVerifications, type VerificationStatusFilter } from "@/lib/verifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_STATUSES: readonly VerificationStatusFilter[] = [
  "all",
  "pending",
  "under_review",
  "approved",
  "rejected",
];

export async function GET(request: NextRequest) {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const statusParam = request.nextUrl.searchParams.get("status") ?? "pending";
  const status = (ALLOWED_STATUSES as readonly string[]).includes(statusParam)
    ? (statusParam as VerificationStatusFilter)
    : "pending";

  const items = await listVerifications(session, status);
  return NextResponse.json({ items });
}
