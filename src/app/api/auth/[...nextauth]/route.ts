import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// Log when the NextAuth API route is initialized
console.log('Initializing NextAuth API route handler');

// Create and export the NextAuth handler
const handler = NextAuth(authOptions);

// Export handler functions for Next.js API routes
export { handler as GET, handler as POST }; 