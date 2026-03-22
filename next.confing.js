/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  trailingSlash: true,
  i18n: {
    locales: ['en', 'hi', 'es', 'fr', 'de', 'ar', 'zh', 'ja', 'ru', 'pt', 'it', 'tr', 'th', 'vi', 'id'],
    defaultLocale: 'en',
    localeDetection: true
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }
        ]
      }
    ]
  }
}
