import { getAdminSession } from "@/lib/admin-guard";
import { listReportQueues } from "@/lib/reports";
import { redirect } from "next/navigation";
import { ReportsClient } from "./reports-client";

export const dynamic = "force-dynamic";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/sign-in");

  const params = await searchParams;
  const statusParam = params.status ?? "pending";
  const status = (
    ["pending", "under_review", "resolved", "dismissed"].includes(statusParam)
      ? statusParam
      : "pending"
  ) as "pending" | "under_review" | "resolved" | "dismissed";

  const queues = await listReportQueues(session);

  return <ReportsClient initialStatus={status} initialQueues={queues} />;
}
