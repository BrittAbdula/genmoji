export function normalizePath(path: string): string {
  const trimmed = (path || '').trim();
  if (trimmed === '' || trimmed === '/') return '/';
  const withLeading = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withLeading.replace(/\/+$/, '');
}

export function withTrailingSlash(url: string): string {
  if (!url) return url;
  return url.endsWith('/') ? url : `${url}/`;
}

export function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}
