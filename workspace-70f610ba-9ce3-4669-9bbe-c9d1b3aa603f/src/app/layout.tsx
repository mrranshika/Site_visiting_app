import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wedabime Pramukayo - Site Visitor Management System",
  description: "Site Visitor Management System for High School Diploma Project",
  manifest: "/manifest.json",
  keywords: ["site visitor", "management", "high school", "project", "construction", "renovation"],
  authors: [{ name: "High School Diploma Project" }],
  openGraph: {
    title: "Wedabime Pramukayo - Site Visitor Management System",
    description: "Site Visitor Management System for High School Diploma Project",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wedabime Pramukayo - Site Visitor Management System",
    description: "Site Visitor Management System for High School Diploma Project",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Wedabime Pramukayo",
    "msapplication-TileColor": "#4CAF50",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#4CAF50" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
