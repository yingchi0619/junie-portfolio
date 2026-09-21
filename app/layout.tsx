import type { Metadata } from 'next';
import './globals.css';
import './cozy-ui.css';
import './pixel-world.css';
export const metadata: Metadata = {
  metadataBase: new URL('https://junie-portfolio.yolanyuyu.workers.dev'),
  title: 'Yingchi (Junie) Zhu | Software, Data & a Little Pixel World',
  description:
    'New Jersey / NYC portfolio of Yingchi (Junie) Zhu. Software engineering and data analytics informed by hands-on last-mile logistics experience.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Yingchi Zhu — A Little Pixel World',
    description:
      'Explore software engineering, data analytics and last-mile operations through an interactive portfolio.',
    type: 'website',
    locale: 'en_US',
  },
  robots: { index: true, follow: true },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
