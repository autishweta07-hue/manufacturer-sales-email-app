import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Manufacturer Sales Email App',
  description: 'Internal workspace for personalised manufacturer outreach campaigns'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans min-h-screen">{children}</body>
    </html>
  );
}
