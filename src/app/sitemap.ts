import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";
import { Emoji, createEmojiResponse } from "@/types/emoji";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;
  const now = new Date();

  const staticRoutes = [
    '',
    'about',
    'pricing',
    'faq',
    'contact',
  ].map(route => ({
    url: `${baseUrl}/${route}`,
    lastModified: now,
  }));

  // 获取动态生成的emoji页面
  const response = await fetch('https://gen.genmojionline.com?limit=36');
  const emojis: Emoji[] = await response.json();
  const dynamicRoutes = emojis.map((emoji: Emoji) => ({
    url: `${baseUrl}/emoji/${emoji.slug}`,
    lastModified: emoji.created_at,
  }));

  return [
    ...staticRoutes,
    ...dynamicRoutes,
  ];
}
