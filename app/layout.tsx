import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
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
  title: "Chassis Decoder - Free Vehicle VIN Inspector",
  description: "Instant VIN lookup and detailed specifications report.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}

        {/* Global Adsterra Popunder Script */}
        <Script
          src="https://pl30665479.effectivecpmnetwork.com/2f/8b/f7/2f8bf7f580704decfcfef351a97fb3d0.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}