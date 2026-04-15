import { generateMetadata } from "@/lib/seo";

export const metadata = generateMetadata({
  title: 'Messages',
  description: 'Communicate with coaches, recruiters, and other athletes through our secure messaging system.',
  noIndex: true
});

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
