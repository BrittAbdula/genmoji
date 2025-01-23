import { siteConfig } from "@/lib/config";
import { type ClassValue, clsx } from "clsx";
import { Metadata } from "next";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL || siteConfig.url}${path}`;
}

export function constructMetadata({
  title,
  description,
  image,
  path = "",
  type = "website",
  ...props
}: {
  title?: string;
  description?: string;
  image?: string;
  path?: string;
  type?: "website" | "article";
  [key: string]: any;
} = {}): Metadata {
  const fullUrl = `${siteConfig.url}${path}`;
  const ogImage = image || siteConfig.seo.openGraph.images[0].url;

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: title || siteConfig.seo.defaultTitle,
      template: siteConfig.seo.titleTemplate,
    },
    description: description || siteConfig.description,
    keywords: siteConfig.seo.keywords,
    
    // Open Graph
    openGraph: {
      type,
      locale: siteConfig.seo.openGraph.locale,
      url: fullUrl,
      siteName: siteConfig.seo.openGraph.siteName,
      title: title || siteConfig.seo.title,
      description: description || siteConfig.description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title || siteConfig.seo.title,
        },
      ],
    },

    // Twitter
    twitter: {
      card: siteConfig.seo.twitter.cardType as "summary" | "summary_large_image" | "player" | "app",
      title: title || siteConfig.seo.title,
      description: description || siteConfig.description,
      site: siteConfig.seo.twitter.site,
      creator: siteConfig.seo.twitter.handle,
      images: [ogImage],
    },

    // 其他元数据
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    },
    
    alternates: {
      canonical: fullUrl,
    },
    
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon-16x16.png',
      apple: '/apple-touch-icon.png',
    },

    ...props,
  };
}

export function formatDate(date: string) {
  let currentDate = new Date().getTime();
  if (!date.includes("T")) {
    date = `${date}T00:00:00`;
  }
  let targetDate = new Date(date).getTime();
  let timeDifference = Math.abs(currentDate - targetDate);
  let daysAgo = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

  let fullDate = new Date(date).toLocaleString("en-us", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  if (daysAgo < 1) {
    return "Today";
  } else if (daysAgo < 7) {
    return `${fullDate} (${daysAgo}d ago)`;
  } else if (daysAgo < 30) {
    const weeksAgo = Math.floor(daysAgo / 7);
    return `${fullDate} (${weeksAgo}w ago)`;
  } else if (daysAgo < 365) {
    const monthsAgo = Math.floor(daysAgo / 30);
    return `${fullDate} (${monthsAgo}mo ago)`;
  } else {
    const yearsAgo = Math.floor(daysAgo / 365);
    return `${fullDate} (${yearsAgo}y ago)`;
  }
}

// 新增：构造分享 URL
export function constructShareUrl(platform: 'twitter' | 'facebook' | 'linkedin', {
  url,
  title,
  description,
  image,
}: {
  url: string;
  title?: string;
  description?: string;
  image?: string;
}) {
  const config = siteConfig.sharing.platforms;
  const encodedUrl = encodeURIComponent(url);

  switch (platform) {
    case 'twitter':
      return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${
        encodeURIComponent(title || config.twitter.text)
      }&via=${config.twitter.via}&hashtags=${siteConfig.sharing.hashtags.join(',')}`;
    
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${
        encodeURIComponent(description || config.facebook.quote)
      }`;
    
    case 'linkedin':
      return `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${
        encodeURIComponent(title || config.linkedin.title)
      }&summary=${encodeURIComponent(description || config.linkedin.summary)}`;
    
    default:
      return url;
  }
}

/**
 * 将普通图片URL转换为优化后的CDN URL
 * @param url 原始图片URL
 * @param width 目标宽度(可选)
 * @returns 优化后的CDN URL
 */
export function getOptimizedImageUrl(url: string, width: number = 800): string {
  if (!url || !url.includes('store.genmojionline.com')) {
    return url;
  }

  const baseUrl = 'https://store.genmojionline.com/';
  const imagePath = url.replace(baseUrl, '');
  
  return `${baseUrl}cdn-cgi/image/format=webp,width=${width}/${imagePath}`;
}

