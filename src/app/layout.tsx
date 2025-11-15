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

export const metadata: Metadata = {
  title: "food battle",
  description: "compare food macros.",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.jpg",
  },
  openGraph: {
    title: "food battle",
    description: "compare food macros",
    images: ["/og-image.webp"],
  },
  twitter: {
    card: "summary_large_image",
    title: "food battle",
    description: "compare food macros",
    images: ["/og-image.webp"],
  },
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
      </body>
    </html>
  );
}
