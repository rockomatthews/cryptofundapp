import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit during hot reloads.
// See https://pris.ly/d/help/next-js-best-practices

// Add custom methods to PrismaClient if needed
type PrismaClientWithExtensions = PrismaClient;

// Declare global to properly handle hot reloads
declare global {
  // eslint-disable-next-line no-var, no-unused-vars
  var prisma: PrismaClientWithExtensions | undefined;
}

// To prevent multiple instances of Prisma Client in development environment
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Check if we should try to initialize the Prisma client or use a mock version
let prisma: PrismaClient;

try {
  if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient();
  } else {
    // In development, use a global variable to avoid multiple instances
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = new PrismaClient();
    }
    prisma = globalForPrisma.prisma;
  }
} catch (error) {
  console.error('Failed to initialize Prisma client:', error);
  // Provide a fallback mock Prisma client for builds where Prisma isn't fully initialized
  // This helps prevent builds from failing while still showing runtime errors
  prisma = {
    $connect: () => Promise.resolve(),
    $disconnect: () => Promise.resolve(),
    // Add other necessary methods as needed for build
  } as unknown as PrismaClient;
}

export default prisma; 