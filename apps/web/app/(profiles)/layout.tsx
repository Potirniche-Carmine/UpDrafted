import { generateMetadata } from "@/lib/seo";

export const metadata = generateMetadata({
  title: 'Profile',
  description: 'View and manage athlete profiles, stats, achievements, and recruitment information on UpDrafted.',
  path: '/profile'
});

export default function ProfilesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
