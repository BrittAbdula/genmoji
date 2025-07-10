import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";
import { Emoji, EmojiResponse } from "@/types/emoji";
import { getEmojiGroups, getEmojis } from "@/lib/api";

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
    // Fetch indexable emojis for sitemap
    const emojis = await getEmojis(0, 5000, 'en', { isIndexable: true });

    // Generate emoji routes for all locales
    const emojiRoutes = locales.flatMap(locale =>
      emojis.map((emoji: Emoji) => ({
        url: `${baseUrl}${locale === 'en' ? '' : '/' + locale}/emoji/${emoji.slug}/`,
        lastModified: emoji.created_at ? new Date(emoji.created_at) : now,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))
    );

    const groups = await getEmojiGroups('en');
    const models = groups.models;
    const colors = groups.colors;
    const categories = groups.categories;

    let dynamicRoutes = locales.flatMap(locale =>
      models.map(model => ({
        url: `${baseUrl}${locale === 'en' ? '' : '/' + locale}${model.name ? `/model/${model.name}` : ''}/`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: model.name === '' ? 1.0 : 0.8,
      }))
    );

    dynamicRoutes = dynamicRoutes.concat(locales.flatMap(locale =>
      colors.map(color => ({
        url: `${baseUrl}${locale === 'en' ? '' : '/' + locale}${color.name ? `/color/${color.name}` : ''}/`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: color.name === '' ? 1.0 : 0.8,
      }))
    ));

    dynamicRoutes = dynamicRoutes.concat(locales.flatMap(locale =>
      categories.map(category => ({
        url: `${baseUrl}${locale === 'en' ? '' : '/' + locale}${category.name ? `/category/${category.name}` : ''}/`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: category.name === '' ? 1.0 : 0.8,
      }))
    ));

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
      ...emojiRoutes,
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
