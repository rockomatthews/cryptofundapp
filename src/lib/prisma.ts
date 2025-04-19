import { PrismaClient } from '../generated/prisma';
import { withAccelerate } from '@prisma/extension-accelerate';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

// Define the type for the extended PrismaClient
type PrismaClientWithExtensions = ReturnType<typeof createPrismaClient>;

// Helper function to create the client with extensions
function createPrismaClient() {
  return new PrismaClient().$extends(withAccelerate());
}

// Create a single PrismaClient instance for the entire app
let prisma: PrismaClientWithExtensions;

// Add prisma to the global type
declare global {
  // eslint-disable-next-line no-unused-vars, no-var
  var prisma: PrismaClientWithExtensions | undefined;
}

if (process.env.NODE_ENV === 'production') {
  // In production, create a new instance each time
  prisma = createPrismaClient();
} else {
  // In development, reuse the same instance to avoid too many connections
  if (!global.prisma) {
    global.prisma = createPrismaClient();
  }
  prisma = global.prisma;
}

export default prisma; 