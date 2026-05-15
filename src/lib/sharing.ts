import { Emoji } from '@/types/emoji';
import { performAction } from '@/lib/api';

export type SharePlatform =
  | 'native'
  | 'whatsapp'
  | 'telegram'
  | 'messenger'
  | 'signal'
  | 'discord'
  | 'x'
  | 'reddit'
  | 'pinterest'
  | 'facebook'
  | 'linkedin'
  | 'pinterest'
  | 'imgur'
  | 'instagram'
  | 'email'
  | 'copy-image'
  | 'copy-link';

export type ShareResult = 'shared' | 'canceled' | 'unsupported' | 'error';

export type DevicePlatform = 'ios' | 'android' | 'desktop';

export function detectPlatform(): DevicePlatform {
  if (typeof window === 'undefined') return 'desktop';
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'desktop';
}

export function getShareUrl(): string {
  if (typeof window === 'undefined') return '';
  return window.location.href;
}

export async function fetchEmojiFile(imageUrl: string, slug: string): Promise<File> {
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
  const blob = await res.blob();
  const type = blob.type || 'image/png';
  const ext = type.includes('webp') ? 'webp' : type.includes('jpeg') ? 'jpg' : 'png';
  return new File([blob], `${slug}.${ext}`, { type });
}

export function canShareFile(file: File): boolean {
  if (typeof navigator === 'undefined') return false;
  if (typeof navigator.canShare !== 'function') return false;
  try {
    return navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}

export function trackShareIntent(slug: string, locale: string, platform: SharePlatform): void {
  performAction(slug, locale, 'copy', { type: 'share', platform } as any).catch((err) => {
    console.error('Failed to record share intent:', err);
  });
}

export async function shareEmojiNative(
  emoji: Pick<Emoji, 'slug' | 'prompt' | 'image_url'>,
  text: string,
  locale: string
): Promise<ShareResult> {
  if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') {
    return 'unsupported';
  }
  let file: File;
  try {
    file = await fetchEmojiFile(emoji.image_url, emoji.slug);
  } catch (err) {
    console.error('Share: failed to fetch image', err);
    return 'error';
  }
  const payload: ShareData = canShareFile(file)
    ? { files: [file], title: emoji.prompt, text, url: getShareUrl() }
    : { title: emoji.prompt, text, url: getShareUrl() };
  try {
    await navigator.share(payload);
    trackShareIntent(emoji.slug, locale, 'native');
    return 'shared';
  } catch (err: any) {
    if (err && (err.name === 'AbortError' || /cancel/i.test(err.message ?? ''))) {
      return 'canceled';
    }
    console.error('navigator.share failed:', err);
    return 'error';
  }
}

export function getPlatformShareUrl(
  platform: Exclude<SharePlatform, 'native' | 'copy-image' | 'copy-link' | 'discord' | 'signal'>,
  url: string,
  text: string,
  image?: string
): string {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(text);
  const img = image ? encodeURIComponent(image) : '';
  switch (platform) {
    case 'whatsapp':
      return `https://api.whatsapp.com/send?text=${t}%20${u}`;
    case 'telegram':
      return `https://t.me/share/url?url=${u}&text=${t}`;
    case 'messenger':
      return `https://www.facebook.com/sharer/sharer.php?u=${u}`;
    case 'x':
      return `https://twitter.com/intent/tweet?url=${u}&text=${t}`;
    case 'reddit':
      return `https://www.reddit.com/submit?url=${u}&title=${t}`;
    case 'pinterest':
      return `https://pinterest.com/pin/create/button/?url=${u}&media=${img}&description=${t}`;
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${u}`;
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${u}`;
    case 'imgur':
      return `https://imgur.com/upload?url=${img}`;
    case 'instagram':
      return '';
    case 'email':
      return `mailto:?subject=${t}&body=${t}%0A%0A${u}`;
    default:
      return '';
  }
}

export async function copyImageToClipboard(imageUrl: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard || !navigator.clipboard.write) {
    return false;
  }
  try {
    const res = await fetch(imageUrl);
    const blob = await res.blob();
    await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
    return true;
  } catch (err) {
    console.error('copyImageToClipboard failed:', err);
    return false;
  }
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('copyTextToClipboard failed:', err);
    return false;
  }
}
