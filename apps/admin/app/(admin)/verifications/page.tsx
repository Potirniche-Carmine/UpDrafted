import { getAdminSession } from "@/lib/admin-guard";
import { listVerifications } from "@/lib/verifications";
import { redirect } from "next/navigation";
import { VerificationsClient } from "./verifications-client";

export const dynamic = "force-dynamic";

export default async function VerificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/sign-in");

  const params = await searchParams;
  const statusParam = params.status ?? "pending";
  const status = (
    ["all", "pending", "under_review", "approved", "rejected"].includes(statusParam)
      ? statusParam
      : "pending"
  ) as "all" | "pending" | "under_review" | "approved" | "rejected";

  const items = await listVerifications(session, status);

  return <VerificationsClient initialStatus={status} initialItems={items} />;
}
