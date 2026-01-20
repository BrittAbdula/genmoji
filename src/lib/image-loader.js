'use client'

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
    // Handle absolute URLs (remote images from CDN)
    if (src.startsWith('http://') || src.startsWith('https://')) {
        // Cloudflare Images already supports width/quality transformation
        // For store.genmojionline.com, the URL format is:
        // https://store.genmojionline.com/cdn-cgi/imagedelivery/{account_id}/{image_id}/{variant}
        // We can append /w={width} for responsive images if needed

        // For now, return the original URL as Cloudflare handles optimization
        return src;
    }

    // Handle local images (from /public directory)
    // In development, serve directly from the origin
    // In production, these will be properly handled
    return src;
}
