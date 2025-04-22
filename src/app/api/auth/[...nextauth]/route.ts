import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

console.log('Loading NextAuth API route handler');

// Enhanced NextAuth handler with error tracking
const createHandler = () => {
  try {
    console.log('Creating NextAuth handler with options:', {
      providersConfigured: authOptions.providers?.length || 0,
      callbacksConfigured: Object.keys(authOptions.callbacks || {}),
      baseUrl: process.env.NEXTAUTH_URL
    });
    
    return NextAuth(authOptions);
  } catch (error) {
    console.error('Error creating NextAuth handler:', error);
    // Still return the handler even if there was an error logging
    return NextAuth(authOptions);
  }
};

// Create handler with the auth options
const handler = createHandler();

// Export handler functions
export { handler as GET, handler as POST }; 