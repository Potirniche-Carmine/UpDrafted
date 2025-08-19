import { generateMetadata } from "@/lib/seo";
import ContactPageContent from './contact-content';

export const metadata = generateMetadata({
  title: 'Contact',
  description: 'Get in touch with the UpDrafted team. We\'re here to help with any questions about our platform.',
  path: '/contact'
});

export default function ContactPage() {
  return <ContactPageContent />;
}