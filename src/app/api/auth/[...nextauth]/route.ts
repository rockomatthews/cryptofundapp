import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// Create handler with the auth options from the lib folder
const handler = NextAuth(authOptions);

// Export handler functions
export { handler as GET, handler as POST }; 