/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Enable the App Router
  experimental: {},
  // Fixes module resolution issues with Prisma
  webpack: (config) => {
    return config;
  },
  serverExternalPackages: ["@prisma/client"]
}

module.exports = nextConfig; 