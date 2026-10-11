import { CATEGORIES } from '@/lib/constants';

export default async function sitemap() {
  const baseUrl = 'https://techcrate.in';

  // Core static routes
  const staticRoutes = [
    '',
    '/products',
    '/projects',
    '/cart',
    '/checkout',
    '/orders',
    '/wishlist',
    '/contact',
    '/policies/shipping',
    '/policies/returns',
    '/policies/cancellation',
    '/policies/warranty',
    '/policies/privacy',
    '/policies/terms',
    '/policies/grievance',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route === '/products' ? 0.9 : 0.7,
  }));

  // Category filter routes
  const categoryRoutes = CATEGORIES.filter((c) => c.id !== 'all').map((c) => ({
    url: `${baseUrl}/products?category=${encodeURIComponent(c.id)}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...categoryRoutes];
}
