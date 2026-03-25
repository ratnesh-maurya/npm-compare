import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import Footer from './components/Footer';
import GitHubLink from './components/GitHubLink';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Package Compare Tool — npm, Go & Elixir | by Ratnesh Maurya',
    template: '%s | Package Compare Tool',
  },
  description:
    'Compare npm, Go module, and Elixir Hex packages side by side. Analyze bundle size, download trends, versions, dependencies, and metadata. Built by Ratnesh Maurya.',
  keywords: [
    'npm compare',
    'npm package comparison',
    'go module comparison',
    'golang package comparison',
    'elixir hex comparison',
    'javascript package analyzer',
    'typescript package comparison',
    'package size checker',
    'npm downloads comparison',
    'go module search',
    'hex.pm package search',
    'package dependency analyzer',
    'multi-ecosystem package tool',
  ],
  authors: [{ name: 'Ratnesh Maurya', url: 'https://www.ratnesh-maurya.com' }],
  creator: 'Ratnesh Maurya',
  publisher: 'Ratnesh Maurya',
  category: 'technology',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ratnesh-maurya.com/',
    title: 'Package Compare Tool — npm, Go & Elixir | by Ratnesh Maurya',
    description:
      'Compare npm, Go module, and Elixir Hex packages side by side. Analyze size, versions, dependencies, and download trends.',
    siteName: 'Package Compare — by Ratnesh Maurya',
    images: [
      {
        url: '/social.png',
        width: 1200,
        height: 630,
        alt: 'Package Comparison Tool for npm, Go, and Elixir',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Package Compare Tool — npm, Go & Elixir',
    description:
      'Compare npm, Go module, and Elixir Hex packages side by side. Analyze size, versions, dependencies, and download trends.',
    creator: '@ratnesh_maurya',
    images: ['/social.png'],
  },
  metadataBase: new URL('https://ratnesh-maurya.com/'),
  alternates: {
    canonical: 'https://ratnesh-maurya.com/',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://ratnesh-maurya.com/#website',
      url: 'https://ratnesh-maurya.com/',
      name: 'Ratnesh Maurya',
      inLanguage: 'en-US',
      publisher: {
        '@id': 'https://ratnesh-maurya.com/#person',
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://ratnesh-maurya.com/?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'WebApplication',
      '@id': 'https://ratnesh-maurya.com/#app',
      url: 'https://ratnesh-maurya.com/',
      name: 'Package Compare Tool — npm, Go & Elixir',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Web',
      description:
        'Compare npm, Go module, and Elixir Hex packages side by side. Analyze bundle size, version metadata, dependencies, and download trends to make faster dependency decisions.',
      creator: {
        '@id': 'https://ratnesh-maurya.com/#person',
      },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    },
    {
      '@type': 'Person',
      '@id': 'https://ratnesh-maurya.com/#person',
      name: 'Ratnesh Maurya',
      url: 'https://ratnesh-maurya.com/',
      sameAs: ['https://ratnesh-maurya.com/', 'https://blog.ratnesh-maurya.com/'],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-100`}>
        <Script
          id="seo-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <GitHubLink />
        <main className="min-h-screen pt-8 pb-16">
          <div className="container mx-auto px-4 py-8">
            {children}
          </div>
        </main>
        <Footer />
      </body>
    </html>
  );
}
