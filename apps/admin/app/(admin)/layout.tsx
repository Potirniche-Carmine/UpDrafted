import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-guard";
import { AdminShell } from "@/components/admin-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/sign-in");
  }
  return <AdminShell admin={{ name: session.name, email: session.email }}>{children}</AdminShell>;
}
