import { type NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '@/lib/prisma';

// Extend the built-in session and JWT types
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      walletAddress?: string | null;
      walletType?: string | null;
    }
  }
}

// Get the URL to use for NextAuth
// This is critical for OAuth callback URLs to work correctly
function getBaseUrl() {
  // We need to make sure we're using the same URL for OAuth callbacks that
  // we've configured in our Google developer console
  if (process.env.NEXTAUTH_URL) {
    console.log('Using NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
    return process.env.NEXTAUTH_URL;
  }
  
  // For production deployments
  if (process.env.NODE_ENV === 'production') {
    const productionUrl = 'https://www.cryptostarter.app';
    console.log('Using production URL:', productionUrl);
    return productionUrl;
  }
  
  // Fallback for local development
  return 'http://localhost:3000';
}

// Log environment variables relevant to NextAuth (excluding secrets)
console.log('NextAuth Config Environment:', { 
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NODE_ENV: process.env.NODE_ENV,
  BASE_URL: getBaseUrl(),
  GOOGLE_CLIENT_ID_SET: !!process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET_SET: !!process.env.GOOGLE_CLIENT_SECRET
});

// NextAuth configuration with Prisma database adapter
export const authOptions: NextAuthOptions = {
  // Simple JWT strategy
  session: {
    strategy: 'jwt',
  },
  
  // Use secure defaults for cookies - no explicit configuration
  
  // Prisma adapter for database storage
  adapter: PrismaAdapter(prisma),
  
  // Google provider with explicit callback URL
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      // Use direct URL without www to avoid domain mismatch
      authorization: {
        url: "https://accounts.google.com/o/oauth2/v2/auth",
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  
  // Custom pages
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  
  // Simplify callbacks
  callbacks: {
    // Simple JWT callback
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    
    // Simple session callback
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  
  // Use NEXTAUTH_SECRET for signing
  secret: process.env.NEXTAUTH_SECRET,
  
  // Disable debugging in production
  debug: false,
}; 