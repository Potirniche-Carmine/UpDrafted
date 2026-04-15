import { generateMetadata } from "@/lib/seo";

export const metadata = generateMetadata({
  title: 'Activity',
  description: 'Track your recent activities and stay updated with the latest interactions. Monitor your progress and engagement all in one place.',
  path: '/activity'
});

export default function PremiumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
