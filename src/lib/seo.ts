import { routing } from '@/i18n/routing';
import { siteConfig } from '@/lib/config';
import type { Emoji } from '@/types/emoji';
import { normalizeBaseUrl, normalizePath, withTrailingSlash } from '@/lib/url';

const LOCALE_ALIASES: Record<string, string[]> = {
  en: ['en-US'],
  ja: ['ja-JP'],
  fr: ['fr-FR'],
  zh: ['zh-CN'],
};

export function localePath(path: string, locale?: string): string {
  const normalized = normalizePath(path);
  if (!locale || locale === routing.defaultLocale) return normalized;
  if (normalized === '/') return `/${locale}/`;
  return `/${locale}${normalized}`;
}

export function buildCanonicalUrl(path: string, locale?: string): string {
  const relative = localePath(path, locale);
  const baseUrl = normalizeBaseUrl(siteConfig.url);
  return withTrailingSlash(`${baseUrl}${relative}`);
}

export function buildAlternates(path: string, locale: string) {
  const canonical = buildCanonicalUrl(path, locale);
  const languages: Record<string, string> = {
    'x-default': buildCanonicalUrl(path, routing.defaultLocale),
  };

  routing.locales.forEach((loc) => {
    const url = buildCanonicalUrl(path, loc);
    languages[loc] = url;
    (LOCALE_ALIASES[loc] || []).forEach((alias) => {
      languages[alias] = url;
    });
  });

  return { canonical, languages };
}

export function isIndexableEmoji(emoji?: Pick<Emoji, 'is_indexable' | 'slug' | 'quality_score'> | null): boolean {
  if (!emoji) return false;
  if (!emoji.is_indexable) return false;
  if (emoji.slug && emoji.slug.includes('--')) return false;
  return true;
}

export function buildOgImageUrl({
  locale,
  title,
  image,
}: {
  locale: string;
  title?: string;
  image?: string;
}): string {
  const ogPath = locale && locale !== routing.defaultLocale ? `/${locale}/og` : '/og';
  const baseUrl = normalizeBaseUrl(siteConfig.url);
  const params = new URLSearchParams();
  if (title) params.set('title', title);
  if (image) params.set('image', image);
  const query = params.toString();
  return `${baseUrl}${ogPath}${query ? `?${query}` : ''}`;
}
