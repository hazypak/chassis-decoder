import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Free VIN Decoder & Chassis Number Checker | Instant Vehicle Specs',
  description:
    'Lookup any vehicle VIN or chassis number instantly. Get free detailed specs, engine info, build year, model decoder, and manufacturer specifications.',
  keywords: [
    'car vin checker',
    'chassis decoder',
    'free vin lookup',
    'vehicle identification number search',
    'check chassis number',
    'vin specification lookup',
  ],
  openGraph: {
    title: 'Free VIN Decoder & Chassis Number Checker',
    description: 'Instant vehicle specs and chassis lookup tool.',
    url: 'https://chassis-decoder.vercel.app',
    siteName: 'Chassis Decoder',
    type: 'website',
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}