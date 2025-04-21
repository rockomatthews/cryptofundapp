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

let prisma: PrismaClientWithExtensions;

if (process.env.NODE_ENV === 'production') {
  // In production, use a new instance each time
  prisma = new PrismaClient();
} else {
  // In development, use a singleton to prevent multiple connections
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default prisma; 