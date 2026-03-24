import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://ratnesh-maurya.com/sitemap.xml',
    host: 'https://ratnesh-maurya.com',
  };
}
