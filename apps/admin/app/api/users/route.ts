import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-guard";
import { listManagedUsers } from "@/lib/users";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? "";
  const users = await listManagedUsers(session, q);
  return NextResponse.json({ users });
}
