import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-guard";

export const runtime = "nodejs";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    userId: session.userId,
    email: session.email,
    name: session.name,
    role: session.role,
  });
}
