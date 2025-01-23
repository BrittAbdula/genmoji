/** @type {import('next').NextConfig} */
const nextConfig = {
  // 如果使用了 Images 组件，需要配置
  images: {
    unoptimized: true,
    domains: ['store.genmojionline.com'],
  },
  output: 'standalone',
  trailingSlash: true,
};

export default nextConfig;
