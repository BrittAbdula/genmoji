import { MetadataRoute } from "next";
import { Emoji } from "@/types/emoji";
import { getEmojiGroups, getEmojis } from "@/lib/api";
import { routing } from "@/i18n/routing";
import { buildCanonicalUrl, isIndexableEmoji } from "@/lib/seo";

// Static routes
const routes = [
  '',
  'gallery',
  'model',
  'color',
  'category',
  'styles',
  'prompts',
  'genmoji-maker',
  'sticker-maker',
  'mascot-maker',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const locales = routing.locales;
  const maxEmojis = Number(process.env.SITEMAP_MAX_EMOJIS || 3000);

  // Generate static routes for all locales
  const staticRoutes = locales.flatMap((locale) =>
    routes.map((route) => ({
      url: buildCanonicalUrl(route, locale),
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: route === '' ? 1.0 : 0.8,
    }))
  );

  try {
    // Fetch indexable emojis for sitemap
    const emojis: Emoji[] = [];
    const batchSize = 100;
    let offset = 0;

    while (emojis.length < maxEmojis) {
      const batch = await getEmojis(offset, batchSize, 'en', { isIndexable: true, sort: 'quality' });
      if (batch.length === 0) break; // No more emojis to fetch
      emojis.push(...batch.filter(isIndexableEmoji));
      offset += batchSize;

      // If we got less than batchSize, we've reached the end
      if (batch.length < batchSize) break;
    }

    // Trim to exactly maxEmojis if we got more
    emojis.splice(maxEmojis);

    // Generate emoji routes for all locales
    const emojiRoutes = locales.flatMap((locale) =>
      emojis.map((emoji: Emoji) => ({
        url: buildCanonicalUrl(`/emoji/${emoji.slug}`, locale),
        lastModified: emoji.created_at ? new Date(emoji.created_at) : now,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))
    );

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

    let dynamicRoutes: MetadataRoute.Sitemap = locales.flatMap((locale) =>
      models.filter((model) => model.name).map((model) => ({
        url: buildCanonicalUrl(`/model/${model.name}`, locale),
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      }))
    );

    dynamicRoutes = dynamicRoutes.concat(
      locales.flatMap((locale) =>
        colors.filter((color) => color.name).map((color) => ({
          url: buildCanonicalUrl(`/color/${color.name}`, locale),
          lastModified: now,
          changeFrequency: 'monthly' as const,
          priority: 0.8,
        }))
      )
    );

    dynamicRoutes = dynamicRoutes.concat(
      locales.flatMap((locale) =>
        categories.filter((category) => category.name).map((category) => ({
          url: buildCanonicalUrl(`/category/${category.name}`, locale),
          lastModified: now,
          changeFrequency: 'monthly' as const,
          priority: 0.8,
        }))
      )
    );

    // Add /styles/[style] pages
    dynamicRoutes = dynamicRoutes.concat(
      locales.flatMap((locale) =>
        styleIds.map((id) => ({
          url: buildCanonicalUrl(`/styles/${id}`, locale),
          lastModified: now,
          changeFrequency: 'monthly' as const,
          priority: 0.7,
        }))
      )
    );

    return [...staticRoutes, ...dynamicRoutes, ...emojiRoutes];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // If fetching dynamic data fails, at least return static routes
    return staticRoutes;
  }
}
