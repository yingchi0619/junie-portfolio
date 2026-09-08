import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  metadataBase: new URL(
    'https://junie-zhu-portfolio.nayukiki.chatgpt.site',
  ),
  title: 'Yingchi (Junie) Zhu | Software Engineering, Data & Operations',
  description:
    'New Jersey / NYC portfolio of Yingchi (Junie) Zhu. Software engineering and data analytics informed by hands-on last-mile logistics experience.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Junie Zhu — Engineering, Data & Operations',
    description:
      'Built with code. Informed by data. Grounded in the real world.',
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
