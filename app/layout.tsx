import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { AuthProvider } from '@/components/auth/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'EduNiche - Your Academic Co-pilot at the Speed of Web3',
  description: 'Connect with verified peer tutors and curated study resources in a community-driven platform.',
  keywords: ['education', 'tutoring', 'study groups', 'web3', 'base', 'farcaster'],
  authors: [{ name: 'EduNiche Team' }],
  openGraph: {
    title: 'EduNiche - Academic Co-pilot',
    description: 'Connect with verified peer tutors and curated study resources.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Providers>
            <div className="min-h-screen bg-mesh">
              {children}
            </div>
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
