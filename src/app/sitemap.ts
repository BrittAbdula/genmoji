import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 直接使用你的生产环境域名
  const domain = 'genmojionline.com/';  // 替换为你的实际域名
  const protocol = 'https';

  return [
    {
      url: `${protocol}://${domain}`,
      lastModified: new Date(),
    },
    // 如果有其他页面，可以在这里添加
  ];
}
