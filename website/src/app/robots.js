export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/account/*', '/checkout', '/orders/*', '/payment/*'],
      },
    ],
    sitemap: 'https://techcrate.in/sitemap.xml',
  };
}
