/**
 * Custom Image Loader for Next.js 16
 * 
 * This loader bypasses Next.js image optimization proxy to directly serve images.
 * This solves two issues in Next.js 16:
 * 1. "upstream image resolved to private ip" error (when using VPN/WARP)
 * 2. 404 errors from /_next/image in development with Turbopack
 * 
 * For Cloudflare Images CDN, images are already optimized at the CDN level,
 * so we don't need Next.js to re-optimize them.
 */
export default function imageLoader({ src, width, quality }) {
    const q = quality || 75;
    const separator = src.includes('?') ? '&' : '?';
    const sizedSrc = `${src}${separator}w=${width}&q=${q}`;

    // Handle absolute URLs (remote images from CDN)
    if (src.startsWith('http://') || src.startsWith('https://')) {
        return sizedSrc;
    }

    // Handle local images (from /public directory)
    return sizedSrc;
}
