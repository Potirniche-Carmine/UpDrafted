import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"; 
import { ClerkProviderWrapper } from "@/components/clerk-theme-wrapper"; 
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { QueryProvider } from '@/components/providers/query-provider'
import { RoleSwitcher } from '@/components/role-switcher'

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial", "sans-serif"]
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
      <body className={`${inter.className} flex flex-col min-h-screen bg-background text-foreground`}>
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
              <RoleSwitcher />
            </ClerkProviderWrapper>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}