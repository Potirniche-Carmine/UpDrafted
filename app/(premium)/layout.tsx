import { generateMetadata } from "@/lib/seo";

export const metadata = generateMetadata({
  title: 'Pricing',
  description: 'Choose the perfect plan for your college recruitment journey. Premium features for serious athletes and coaches.',
  path: '/pricing'
});

export default function PremiumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
