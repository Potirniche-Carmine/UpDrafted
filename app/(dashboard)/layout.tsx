import { generateMetadata } from "@/lib/seo";

export const metadata = generateMetadata({
  title: 'Dashboard',
  description: 'Manage your recruitment profile, view connections, and track your college recruitment progress.',
  noIndex: true
});

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
