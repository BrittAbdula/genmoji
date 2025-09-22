import { Inter, Outfit, Plus_Jakarta_Sans } from 'next/font/google';

// 主字体：现代、清晰、专业
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
});

// 标题字体：圆润、友好、现代
export const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  preload: false, // 只预加载主字体，减少初始加载
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
});

// 备选标题字体：现代、活泼
export const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  preload: false, // 只预加载主字体，减少初始加载
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
});
