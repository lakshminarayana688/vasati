import type { Metadata } from 'next';
import { Poppins, Inter } from 'next/font/google';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

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
    <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
      <body className="antialiased bg-[#F8F3FF] text-[#241044] font-sans selection:bg-[#F1E8FF] selection:text-[#5B0BB5]">{children}</body>
    </html>
  );
}
