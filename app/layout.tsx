import { Toaster } from '@/components/ui/toaster';
import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'Blob Text Manager',
  description:
    'A specialized text file management application built on Vercel Blob Storage',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
