// API 配置文件 - 统一管理所有 API 端点

// 统一 API 基础 URL
export const API_BASE_URL = 'https://genmoji-api.genmojionline.com';

// API 端点
export const API_ENDPOINTS = {
  // Emoji 相关
  EMOJI_BY_SLUG: (slug: string) => `/genmoji/by-slug/${slug}`,
  EMOJI_LIST: '/genmoji/list',
  EMOJI_SEARCH: '/genmoji/search',
  EMOJI_RELATED: (slug: string) => `/genmoji/related/${slug}`,
  EMOJI_BY_BASE_SLUG: (baseSlug: string) => `/genmoji/by-base-slug/${baseSlug}`,
  EMOJI_GROUPS: '/genmoji/groups',
  EMOJI_GENERATE: '/genmoji/generate',
  
  // 操作相关
  ACTION_LIKE: (slug: string) => `/action/${slug}/like`,
  ACTION_GENERAL: (slug: string) => `/action/${slug}`,
  
  // 认证相关
  AUTH_GOOGLE_LOGIN: '/auth/google-login',
  AUTH_ME: '/auth/me',
  AUTH_MY_EMOJIS: '/auth/my-emojis',
  AUTH_LOGOUT: '/auth/logout',
  
  // 上传相关
  UPLOAD_IMAGE: '/upload/image',
  UPLOAD_IMAGE_BY_URL: '/upload/image-by-url',
  
  // 订阅相关
  SUBSCRIPTION_PLANS: '/subscription/plans',
  SUBSCRIPTION_STATUS: '/subscription/status',
  SUBSCRIPTION_CREATE: '/subscription/create',
  SUBSCRIPTION_CANCEL: '/subscription/cancel',
} as const;

// API 请求帮助函数
export function getApiUrl(endpoint: string, locale?: string): string {
  const url = new URL(endpoint, API_BASE_URL);
  if (locale) {
    url.searchParams.set('locale', locale);
  }
  return url.toString();
}

// 通用请求头
export const DEFAULT_HEADERS = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
} as const;

// 带认证的请求头
export function getAuthHeaders(token: string): Record<string, string> {
  return {
    ...DEFAULT_HEADERS,
    'Authorization': `Bearer ${token}`,
  };
} 