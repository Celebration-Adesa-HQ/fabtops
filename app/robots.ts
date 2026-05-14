import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/account/',
        '/cart/',
        '/login',
        '/register',
        '/search',
        '/*?*', // Disallow URL parameters to prevent duplicate content
      ],
    },
    sitemap: 'https://fabtops.com.ng/sitemap.xml',
  };
}
