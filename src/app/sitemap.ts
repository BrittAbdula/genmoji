import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";
import { Emoji, EmojiResponse } from "@/types/emoji";
import { getEmojiGroups, getEmojis } from "@/lib/api";

// Static routes (only default language for sitemap)
const routes = [
  '',
  'gallery',
  'model',
  'color',
  'category',
  'styles',
  'prompts',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;
  const now = new Date();

  // Generate static routes for default language only
  const staticRoutes = routes.map(route => ({
    url: `${baseUrl}${route ? `/${route}` : ''}/`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  try {
    // Fetch indexable emojis for sitemap
    const emojis: Emoji[] = [];
    const batchSize = 100;
    const maxEmojis = 6282;
    let offset = 0;

    // while (emojis.length < maxEmojis) {
    //   const batch = await getEmojis(offset, batchSize, 'en', { isIndexable: true });
    //   if (batch.length === 0) break; // No more emojis to fetch

    //   emojis.push(...batch);
    //   offset += batchSize;

    //   // If we got less than batchSize, we've reached the end
    //   if (batch.length < batchSize) break;
    // }

    // Trim to exactly maxEmojis if we got more
    emojis.splice(maxEmojis);

    // Generate emoji routes for default language only
    const emojiRoutes = emojis.map((emoji: Emoji) => ({
      url: `${baseUrl}/emoji/${emoji.slug}/`,
      lastModified: emoji.created_at ? new Date(emoji.created_at) : now,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    const groups = await getEmojiGroups('en');
    const models = groups.models;
    const colors = groups.colors;
    const categories = groups.categories;

    // Styles detail pages based on available styles
    const styleIds = [
      'genmoji',
      'sticker',
      'gemstickers',
      'pixel',
      'handdrawn',
      '3d',
      'claymation',
      'origami',
      'cross-stitch',
      'steampunk',
      'liquid-metal',
    ] as const;

    let dynamicRoutes = models.map(model => ({
      url: `${baseUrl}${model.name ? `/model/${model.name}` : ''}/`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: model.name === '' ? 1.0 : 0.8,
    }));

    dynamicRoutes = dynamicRoutes.concat(
      colors.map(color => ({
        url: `${baseUrl}${color.name ? `/color/${color.name}` : ''}/`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: color.name === '' ? 1.0 : 0.8,
      }))
    );

    dynamicRoutes = dynamicRoutes.concat(
      categories.map(category => ({
        url: `${baseUrl}${category.name ? `/category/${category.name}` : ''}/`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: category.name === '' ? 1.0 : 0.8,
      }))
    );

    // Add /styles/[style] pages
    dynamicRoutes = dynamicRoutes.concat(
      styleIds.map(id => ({
        url: `${baseUrl}/styles/${id}/`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
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