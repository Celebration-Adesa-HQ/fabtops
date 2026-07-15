const DEFAULT_SITE_URL = 'https://fabtops.com.ng';

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '');
}

export function absoluteUrl(path = '/') {
  const base = getSiteUrl();
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

