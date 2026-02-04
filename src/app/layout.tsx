import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "TalkMCA - AI Sales Call Training Platform",
    template: "%s | TalkMCA",
  },
  description:
    "Practice sales calls with AI prospects that push back, ask tough questions, and make you earn the sale. Get instant scoring on tone, objection handling, rapport, and closing techniques.",
  keywords: [
    "sales training",
    "AI sales practice",
    "call training",
    "sales coaching",
    "voice AI",
    "sales simulation",
    "objection handling",
    "sales skills",
    "MCA sales",
    "merchant cash advance",
  ],
  authors: [{ name: "CCAP Solutions" }],
  creator: "CCAP Solutions",
  publisher: "CCAP Solutions",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "TalkMCA",
    title: "TalkMCA - Practice Sales Calls Without the Awkwardness",
    description:
      "Talk to AI prospects that push back, ask tough questions, and make you earn the sale. 20+ personas, instant scoring, real voice conversations.",
  },
  twitter: {
    card: "summary_large_image",
    title: "TalkMCA - AI Sales Call Training",
    description:
      "Practice sales calls with AI. Get scored on tone, objection handling, rapport, and closing. Improve before it counts.",
  },
  applicationName: "TalkMCA",
  category: "Sales Training",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
