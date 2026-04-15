import { pageMetadata } from "@/lib/seo";
import ContactPageContent from './contact-content';

export const metadata = pageMetadata.contact();

export default function ContactPage() {
  return <ContactPageContent />;
}