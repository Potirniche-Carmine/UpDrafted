import { generateMetadata } from "@/lib/seo";

export const metadata = generateMetadata({
  title: 'Search',
  description: 'Search and discover student-athletes and college programs. Advanced filters for sports, positions, academics, and more.',
  path: '/search'
});

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
