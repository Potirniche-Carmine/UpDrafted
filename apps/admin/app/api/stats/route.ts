import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-guard";
import { getAdminStats } from "@/lib/stats";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;
  const stats = await getAdminStats(session);
  return NextResponse.json(stats);
}
