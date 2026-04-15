import { generateMetadata } from "@/lib/seo";

export const metadata = generateMetadata({
  title: 'Notifications',
  description: 'Stay updated with your latest messages, connections, and recruitment opportunities.',
  noIndex: true
});

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
