import type { Metadata } from 'next';
import { Urbanist, Orbitron, Protest_Strike, Poppins } from 'next/font/google';
import './globals.css';

const urbanist = Urbanist({
  variable: '--font-urbanist',
  subsets: ['latin'],
  display: 'swap',
});

const orbitron = Orbitron({
  variable: '--font-orbitron',
  subsets: ['latin'],
  display: 'swap',
});

const protestStrike = Protest_Strike({
  variable: '--font-protest-strike',
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
});

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

import { QueryProvider } from '@/components/providers/QueryProvider';

export const metadata: Metadata = {
  title: 'Metro Transaction Scheduling',
  description: 'Transaction schedule and execution operations portal',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const fontClasses = [
    urbanist.variable,
    orbitron.variable,
    protestStrike.variable,
    poppins.variable,
  ].join(' ');

  return (
    <html lang="en" className={`${fontClasses} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-brand-page text-brand-primary">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
