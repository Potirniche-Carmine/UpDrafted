import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-guard";
import { getManagedUserDetail } from "@/lib/users";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  if (!id.trim()) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  const user = await getManagedUserDetail(session, id);
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(user);
}
