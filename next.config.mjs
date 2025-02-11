/** @type {import('next').NextConfig} */
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  // 如果使用了 Images 组件，需要配置
  images: {
    unoptimized: true,
    domains: ['store.genmojionline.com'],
  },
  output: 'standalone',
  trailingSlash: true
};

export default withNextIntl(nextConfig);
