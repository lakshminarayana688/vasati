import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VASATI – Your Space. Our Priority. | PG & Co-living Rental App',
  description: 'VASATI is a premium PG & Co-living rental app with verified listings, transparent 8% owner commissions, and anti-bypass booking protection.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#F8F6FC]">{children}</body>
    </html>
  );
}

