import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/config';
import { normalizeBaseUrl } from '@/lib/url';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = normalizeBaseUrl(siteConfig.url);
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/_next/',
        '/my-emojis',
        '/subscription',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
