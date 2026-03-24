import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import Footer from './components/Footer';
import GitHubLink from './components/GitHubLink';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'NPM Compare Tool by Ratnesh Maurya',
    template: '%s | NPM Compare Tool',
  },
  description:
    'Compare npm packages across size, download trends, versions, and metadata. Built by Ratnesh Maurya for faster package decisions.',
  keywords: [
    'npm compare',
    'npm package comparison',
    'javascript package analyzer',
    'typescript package comparison',
    'package size checker',
    'npm downloads comparison',
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
    title: 'NPM Compare Tool by Ratnesh Maurya',
    description:
      'Compare npm packages side by side. Analyze versions, dependencies, size, and downloads.',
    siteName: 'Ratnesh Maurya',
    images: [
      {
        url: '/social.png',
        width: 1200,
        height: 630,
        alt: 'NPM Package Comparator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NPM Compare Tool by Ratnesh Maurya',
    description:
      'Compare npm packages side by side. Analyze versions, dependencies, size, and downloads.',
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
      name: 'NPM Compare Tool',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Web',
      description:
        'Compare npm packages across size, version metadata, and download trends to make faster dependency decisions.',
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
      <body className={`${inter.className} bg-[#E9E4DC]`}>
        <Script
          id="seo-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className="fixed top-gradient h-4 w-full bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 z-50"></div>
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
