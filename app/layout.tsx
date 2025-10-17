import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"; 
import { ClerkProviderWrapper } from "@/components/clerk-theme-wrapper"; 
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { QueryProvider } from '@/components/providers/query-provider'
import { SubscriptionProvider } from '@/components/providers/subscription-provider'
import { generateMetadata } from "@/lib/seo";
import { ToastContainer } from "@/components/ui/toast";
import Script from "next/script";

const roboto = Roboto({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial", "sans-serif"],
  variable: "--font-roboto"
});

export const metadata: Metadata = generateMetadata({
  title: 'UpDrafted',
  description: 'The premier platform connecting student-athletes with D1, D2, D3, and JUCO college programs. Streamline your recruitment process with UpDrafted.',
  noIndex: false 
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="application-name" content="UpDrafted" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="UpDrafted" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#01ae79" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#01ae79" />

        <link rel="manifest" href="/site.webmanifest" />
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "UpDrafted",
                "description": "The premier platform connecting student-athletes with D1, D2, D3, and JUCO college programs.",
                "url": "https://updrafted.us",
                "logo": "https://updrafted.us/icons/icon-512x512.png",
                "contactPoint": {
                  "@type": "ContactPoint",
                  "contactType": "Customer Service",
                  "url": "https://updrafted.us/contact",
                  "availableLanguage": "English"
                },
                "offers": {
                  "@type": "Offer",
                  "category": "Sports Recruitment Services",
                  "description": "College athletic recruitment platform services"
                }
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "UpDrafted",
                "url": "https://updrafted.us",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": "https://updrafted.us/search?q={search_term_string}"
                  },
                  "query-input": "required name=search_term_string"
                }
              }
            ])
          }}
        />
      </head>
      <body className={`${roboto.className} text-lg flex flex-col min-h-screen bg-background text-foreground`}>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ClerkProviderWrapper
              afterSignOutUrl="/"
              appearanceVariables={{ colorPrimary: 'green' }} 
            >
              <SubscriptionProvider>
                <Header />
                <main className="flex-grow container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
                  {children}
                </main>
                <Footer />
                <MobileBottomNav />
                <ToastContainer />
              </SubscriptionProvider>
            </ClerkProviderWrapper>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}