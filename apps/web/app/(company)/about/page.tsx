import { pageMetadata } from "@/lib/seo";
import AboutPageContent from './about-content';

export const metadata = pageMetadata.about();

export default function AboutPage() {
  return <AboutPageContent />;
}