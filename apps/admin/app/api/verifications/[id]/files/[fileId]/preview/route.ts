import { NextResponse } from "next/server";
import { verificationFiles } from "@updrafted/db";
import { and, eq } from "drizzle-orm";
import { generatePresignedUrl } from "@updrafted/storage";
import { requireAdminApi } from "@/lib/admin-guard";
import { executeAsAdmin } from "@/lib/db-access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; fileId: string }> },
) {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const { id, fileId } = await params;
  const verificationId = Number.parseInt(id, 10);
  const parsedFileId = Number.parseInt(fileId, 10);
  if (
    !Number.isInteger(verificationId) ||
    verificationId <= 0 ||
    !Number.isInteger(parsedFileId) ||
    parsedFileId <= 0
  ) {
    return NextResponse.json({ error: "Invalid file id" }, { status: 400 });
  }

  const file = await executeAsAdmin(session, async (tx) => {
    return await tx.query.verificationFiles.findFirst({
      where: and(
        eq(verificationFiles.id, parsedFileId),
        eq(verificationFiles.verificationRequestId, verificationId),
      ),
      columns: {
        r2Key: true,
      },
    });
  });

  if (!file?.r2Key) {
    return NextResponse.json({ error: "File preview unavailable" }, { status: 404 });
  }

  const url = await generatePresignedUrl(file.r2Key, 300, "GET", true);
  return NextResponse.redirect(url, 302);
}
