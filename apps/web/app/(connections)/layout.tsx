import { generateMetadata } from "@/lib/seo";

export const metadata = generateMetadata({
  title: 'Connections',
  description: 'Manage your network of connections with coaches, recruiters, and other athletes.',
  noIndex: true
});

export default function ConnectionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
