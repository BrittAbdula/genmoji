import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";
import { Emoji, EmojiResponse } from "@/types/emoji";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;
  const now = new Date();

  const staticRoutes = [
    '',
    // 'about',
    // 'pricing',
    // 'faq',
    // 'contact',
    // 'privacy',
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
  }));

  try {
    // 获取动态生成的emoji页面
    const response = await fetch('https://gen.genmojionline.com?limit=36', {
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

    const dynamicRoutes = emojiResponse.emojis.map((emoji: Emoji) => ({
      url: `${baseUrl}emoji/${emoji.slug}/`,
      lastModified: emoji.created_at ? new Date(emoji.created_at) : now,
    }));

    return [
      ...staticRoutes,
      ...dynamicRoutes,
    ];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // 如果获取动态数据失败，至少返回静态路由
    return staticRoutes;
  }
}
