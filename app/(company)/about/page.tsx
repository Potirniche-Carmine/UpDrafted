import { generateMetadata } from "@/lib/seo";
import AboutPageContent from './about-content';

export const metadata = generateMetadata({
  title: 'About',
  description: 'Learn about UpDrafted and our mission to connect student-athletes with college programs.',
  path: '/about'
});

export default function AboutPage() {
  return <AboutPageContent />;
}