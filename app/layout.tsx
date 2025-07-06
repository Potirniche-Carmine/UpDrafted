import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"; 
import { ClerkProviderWrapper } from "@/components/clerk-theme-wrapper"; 
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { QueryProvider } from '@/components/providers/query-provider'

const roboto = Roboto({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial", "sans-serif"],
  variable: "--font-roboto"
});

export const metadata: Metadata = {
  title: "UpDrafted - College Athletic Recruitment",
  description: "Connecting student-athletes with D1, D2, D3, and JUCO college programs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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