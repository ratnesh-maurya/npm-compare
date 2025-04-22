import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import GitHubLink from './components/GitHubLink';
import Footer from './components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NPM Package Comparator | Compare npm packages side by side',
  description: 'Compare npm packages across multiple dimensions including size, downloads, versions, and dependencies. Make informed decisions about which package to use.',
  keywords: 'npm, package comparison, javascript, typescript, package size, downloads, dependencies',
  authors: [{ name: 'Ratnesh Maurya', url: 'https://www.ratnesh-maurya.com' }],
  creator: 'Ratnesh Maurya',
  publisher: 'Ratnesh Maurya',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://npm-compare.ratnesh-maurya.com/',
    title: 'NPM Package Comparator',
    description: 'Compare npm packages side by side. Analyze versions, dependencies, downloads, and more.',
    siteName: 'NPM Package Comparator',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NPM Package Comparator',
    description: 'Compare npm packages side by side. Analyze versions, dependencies, downloads, and more.',
    creator: '@ratnesh_maurya',
  },
  metadataBase: new URL('https://npm-compare.ratnesh-maurya.com/'),
  alternates: {
    canonical: 'https://npm-compare.ratnesh-maurya.com/',
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
        <GitHubLink />
        <main className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            {children}
          </div>
        </main>
        <Footer />
      </body>
    </html>
  );
}