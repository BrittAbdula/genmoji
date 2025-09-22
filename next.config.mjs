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
  trailingSlash: true,
  
  // 性能优化配置
  compress: true,
  poweredByHeader: false,
  
  // 实验性功能
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
  },
  
  // 缓存配置
  async headers() {
    return [
      {
        // 静态页面缓存 1 小时
        source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        // API 路由短期缓存
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control', 
            value: 'public, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
      {
        // 静态资源长期缓存
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // 安全头
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
