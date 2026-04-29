import { getAdminSession } from "@/lib/admin-guard";
import { listManagedUsers } from "@/lib/users";
import { redirect } from "next/navigation";
import { UsersClient } from "./users-client";

export const dynamic = "force-dynamic";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; user?: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/sign-in");

  const params = await searchParams;
  const query = params.q ?? "";
  const users = await listManagedUsers(session, query);

  return (
    <UsersClient
      initialQuery={query}
      initialUsers={users}
      initialSelectedUserId={params.user ?? null}
    />
  );
}
