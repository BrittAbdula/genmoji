/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用 Cloudflare Pages 兼容性
  experimental: {
    cloudflarePages: true,
  },
  // 如果使用了 Images 组件，需要配置
  images: {
    unoptimized: true,
    domains: ['store.genmojionline.com'],
  },
  output: 'standalone',
};

export default nextConfig;
