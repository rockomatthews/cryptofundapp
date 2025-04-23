/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable the App Router
  experimental: {},
  // Fixes module resolution issues with Prisma
  webpack: (config) => {
    // Add the ignore-loader for test files
    config.module.rules.push({
      test: /\.(test|spec)\.[jt]sx?$|tests\/.*\.[jt]sx?$|(target\/types\/crypto_fund_me)/,
      use: 'ignore-loader'
    });
    return config;
  },
  // Add security headers to improve OAuth reliability
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
      {
        // Add CORS headers for /api routes
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: 'https://www.cryptostarter.app' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ];
  },
  // Exclude specific packages from the server bundle to avoid issues
  serverExternalPackages: ["@prisma/client"],
  // Use the NEXTAUTH_URL for public domains to ensure consistency
  env: {
    NEXT_PUBLIC_VERCEL_URL: process.env.NEXTAUTH_URL || "https://www.cryptostarter.app",
    NEXT_PUBLIC_SITE_URL: process.env.NEXTAUTH_URL || "https://www.cryptostarter.app"
  }
}

module.exports = nextConfig; 