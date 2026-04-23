import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "UpDrafted Admin",
  description: "Admin dashboard for UpDrafted moderators.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[color:var(--background)] text-[color:var(--foreground)]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
