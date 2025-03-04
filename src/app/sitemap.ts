import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";
import { Emoji, EmojiResponse } from "@/types/emoji";
import { getEmojis } from "@/lib/api";

// Supported locales
const locales = ['en', 'fr', 'ja', 'zh'];

// Static routes that should be available in all locales
const routes = [
  '',
  'gallery',
  'genmoji-maker',
  'sticker-maker',
  'mascot-maker',
  'model',
  'color',
  'category',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;
  const now = new Date();

  // Generate static routes for all locales
  const staticRoutes = locales.flatMap(locale => 
    routes.map(route => ({
      url: `${baseUrl}${locale === 'en' ? '' : '/' + locale}${route ? `/${route}` : ''}/`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: route === '' ? 1.0 : 0.8,
    }))
  );

  try {
    // Fetch dynamically generated emoji pages
    const emojis = await getEmojis(0, 1000, 'en');
    // Generate emoji routes for all locales
    const dynamicRoutes = locales.flatMap(locale =>
      emojis.map((emoji: Emoji) => ({
        url: `${baseUrl}${locale === 'en' ? '' : '/' + locale}/emoji/${emoji.slug}/`,
        lastModified: emoji.created_at ? new Date(emoji.created_at) : now,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))
    );

    return [
      // Root URL without locale
      {
        url: baseUrl + '/',
        lastModified: now,
        changeFrequency: 'daily' as const,
        priority: 1.0,
      },
      ...staticRoutes,
      ...dynamicRoutes,
    ];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // If fetching dynamic data fails, at least return static routes
    return [
      {
        url: baseUrl + '/',
        lastModified: now,
        changeFrequency: 'daily' as const,
        priority: 1.0,
      },
      ...staticRoutes,
    ];
  }
}
