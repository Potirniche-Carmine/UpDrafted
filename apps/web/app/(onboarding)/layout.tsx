import { generateMetadata } from "@/lib/seo";

export const metadata = generateMetadata({
  title: 'Onboarding',
  description: 'Complete your profile setup to get started with UpDrafted. Connect with college programs and coaches.',
  noIndex: true
});

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
