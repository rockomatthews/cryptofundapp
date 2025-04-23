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
  serverExternalPackages: ["@prisma/client"],
  // Use the NEXTAUTH_URL for public domains to ensure consistency
  env: {
    NEXT_PUBLIC_VERCEL_URL: process.env.NEXTAUTH_URL || "https://www.cryptostarter.app",
    NEXT_PUBLIC_SITE_URL: process.env.NEXTAUTH_URL || "https://www.cryptostarter.app"
  }
}

module.exports = nextConfig; 