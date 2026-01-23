import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FightReplay AI - Turn Your Arguments Into Epic Battles",
  description:
    "Upload screenshots of your conversations and watch AI transform them into animated battles. See who really won the argument!",
  keywords: [
    "argument analyzer",
    "conversation battle",
    "AI chat analysis",
    "relationship tool",
    "discussion analyzer",
  ],
  authors: [{ name: "FightReplay AI" }],
  openGraph: {
    title: "FightReplay AI - Turn Your Arguments Into Epic Battles",
    description:
      "Upload screenshots of your conversations and watch AI transform them into animated battles.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "FightReplay AI",
    description: "Turn your arguments into epic animated battles!",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
