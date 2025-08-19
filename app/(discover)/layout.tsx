import { generateMetadata } from "@/lib/seo";

export const metadata = generateMetadata({
  title: 'Discover',
  description: 'Discover schools, coaches, and opportunities that match your athletic profile and goals.',
  noIndex: true
});

export default function DiscoverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
