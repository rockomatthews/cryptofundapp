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
  // Exclude specific packages from the server bundle to avoid issues
  serverExternalPackages: ["@prisma/client"]
}

module.exports = nextConfig; 