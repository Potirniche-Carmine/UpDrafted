import { requireRolePage } from "@/utils/roles";
import { AdminInitClient } from "./admin-init-client";

export default async function AdminPage() {
  const { user } = await requireRolePage(["admin"]);
  return <AdminInitClient userEmail={user.email} />;
}
