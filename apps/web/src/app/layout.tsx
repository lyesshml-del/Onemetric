import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "OneMetric — Simple, affordable analytics",
  description:
    "All-in-one analytics for indie hackers and SaaS founders: website analytics, events, funnels and revenue attribution.",
  openGraph: {
    title: "OneMetric — Simple, affordable analytics",
    description:
      "Cookieless website analytics, events, funnels and revenue attribution — in one place.",
    url: appUrl,
    siteName: "OneMetric",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OneMetric — Simple, affordable analytics",
    description:
      "Cookieless website analytics, events, funnels and revenue attribution — in one place.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="bg-background text-foreground min-h-full font-sans">
        {children}
      </body>
    </html>
  );
}
