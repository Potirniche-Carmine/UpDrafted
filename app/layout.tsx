import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"; 
import { ClerkProviderWrapper } from "@/components/clerk-theme-wrapper"; 
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { QueryProvider } from '@/components/providers/query-provider'
import { generateMetadata } from "@/lib/seo";
import Script from "next/script";

const roboto = Roboto({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial", "sans-serif"],
  variable: "--font-roboto"
});

export const metadata: Metadata = generateMetadata({});

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
        <meta name="description" content="The premier platform connecting student-athletes with college programs" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#22c55e" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#22c55e" />

        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/logo.png" />

        <link rel="icon" type="image/png" sizes="32x32" href="/logo.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/logo.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/logo.png" color="#22c55e" />
        <link rel="shortcut icon" href="/favicon.ico" />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:url" content="https://updrafted.us" />
        <meta name="twitter:title" content="UpDrafted" />
        <meta name="twitter:description" content="The premier platform connecting student-athletes with college programs" />
        <meta name="twitter:image" content="https://updrafted.us/logo.png" />
        <meta name="twitter:creator" content="@updrafted" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="UpDrafted" />
        <meta property="og:description" content="The premier platform connecting student-athletes with college programs" />
        <meta property="og:site_name" content="UpDrafted" />
        <meta property="og:url" content="https://updrafted.us" />
        <meta property="og:image" content="https://updrafted.us/logo.png" />

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
                "logo": "https://updrafted.us/logo.png"
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "UpDrafted",
                "url": "https://updrafted.us",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": "https://updrafted.us/search?q={search_term_string}",
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
              <Header />
              <main className="flex-grow container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8">
                {children}
              </main>
              <Footer />
            </ClerkProviderWrapper>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}