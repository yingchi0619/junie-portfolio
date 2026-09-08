import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  metadataBase: new URL('https://junie-zhu-portfolio.nayukiki.chatgpt.site'),
  title: 'Junie Zhu | Systems in Motion — Engineering, Data & Operations',
  description:
    'New Jersey / NYC portfolio of Yingchi (Junie) Zhu. Software engineering and data analytics informed by hands-on last-mile logistics experience.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Junie Zhu — Systems in Motion',
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
