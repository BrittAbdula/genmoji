import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";
import { Emoji, EmojiResponse } from "@/types/emoji";

// Supported locales
const locales = ['en', 'fr', 'ja', 'zh'];

// Static routes that should be available in all locales
const routes = [
  '',
  'gallery',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;
  const now = new Date();

  // Generate static routes for all locales
  const staticRoutes = locales.flatMap(locale => 
    routes.map(route => ({
      url: `${baseUrl}/${locale}${route ? `/${route}` : ''}/`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: route === '' ? 1.0 : 0.8,
    }))
  );

  try {
    // Fetch dynamically generated emoji pages
    const response = await fetch('https://gen.genmojionline.com?limit=1000', {
      headers: {
        'Origin': 'https://genmojionline.com'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch emojis');
    }

    const emojiResponse = await response.json() as EmojiResponse;
    
    if (!emojiResponse.success || !emojiResponse.emojis) {
      throw new Error('No emojis found');
    }

    // Generate emoji routes for all locales
    const dynamicRoutes = locales.flatMap(locale =>
      emojiResponse.emojis.map((emoji: Emoji) => ({
        url: `${baseUrl}/${locale}/emoji/${emoji.slug}/`,
        lastModified: emoji.created_at ? new Date(emoji.created_at) : now,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))
    );

    return [
      // Root URL without locale
      {
        url: baseUrl,
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
        url: baseUrl,
        lastModified: now,
        changeFrequency: 'daily' as const,
        priority: 1.0,
      },
      ...staticRoutes,
    ];
  }
}
