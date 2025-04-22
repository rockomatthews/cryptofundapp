import { PrismaClient } from '../generated/prisma';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// This ensures the Prisma Client is only instantiated once
let prisma: PrismaClient;

// Only initialize Prisma on the server side
if (typeof window === 'undefined') {
  if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient();
  } else {
    // In development, use global to avoid multiple instances
    if (!global.prisma) {
      global.prisma = new PrismaClient({
        log: ['query', 'error', 'warn'],
      });
    }
    prisma = global.prisma;
  }
} else {
  // Return an empty object on client-side
  prisma = {} as PrismaClient;
}

export default prisma; 