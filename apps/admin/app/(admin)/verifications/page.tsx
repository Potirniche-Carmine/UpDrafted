import { getAdminSession } from "@/lib/admin-guard";
import { listVerificationQueues } from "@/lib/verifications";
import { redirect } from "next/navigation";
import { VerificationsClient } from "./verifications-client";

export const dynamic = "force-dynamic";

export default async function VerificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/sign-in");

  const params = await searchParams;
  const statusParam = params.status ?? "pending";
  const status = (
    ["pending", "approved", "rejected"].includes(statusParam)
      ? statusParam
      : "pending"
  ) as "pending" | "approved" | "rejected";
  const typeParam = params.type ?? "all";
  const type = (
    ["all", "general", "transfer_portal"].includes(typeParam)
      ? typeParam
      : "all"
  ) as "all" | "general" | "transfer_portal";

  const queues = await listVerificationQueues(session);

  return <VerificationsClient initialStatus={status} initialType={type} initialQueues={queues} />;
}
