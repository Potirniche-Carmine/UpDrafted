import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-guard";
import { listVerifications, type VerificationStatusFilter, type VerificationTypeFilter } from "@/lib/verifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_STATUSES: readonly VerificationStatusFilter[] = [
  "pending",
  "approved",
  "rejected",
];
const ALLOWED_TYPES: readonly VerificationTypeFilter[] = ["all", "general", "transfer_portal"];

export async function GET(request: NextRequest) {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const statusParam = request.nextUrl.searchParams.get("status") ?? "pending";
  const status = (ALLOWED_STATUSES as readonly string[]).includes(statusParam)
    ? (statusParam as VerificationStatusFilter)
    : "pending";
  const typeParam = request.nextUrl.searchParams.get("type") ?? "all";
  const type = (ALLOWED_TYPES as readonly string[]).includes(typeParam)
    ? (typeParam as VerificationTypeFilter)
    : "all";

  const items = await listVerifications(session, status, type);
  return NextResponse.json({ items });
}
