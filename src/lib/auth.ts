import { type NextAuthOptions, Session } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '@/lib/prisma';
import { Adapter } from 'next-auth/adapters';

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
  // Use JWT strategy as it's more resilient if DB connections are unstable
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  // Default cookie configuration - let the browser handle domain inference
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true
      }
    }
  },
  
  // Prisma adapter to store user accounts
  adapter: PrismaAdapter(prisma) as Adapter,
  
  // Configure the Google provider with all required OAuth parameters
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "consent", // Always show consent screen
          access_type: "offline", // Get refresh token
          response_type: "code" // Authorization code flow
        }
      }
    }),
  ],
  
  // Custom pages
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  
  // Callbacks with simplified and stable JWT/session logic
  callbacks: {
    // Add user info to JWT token
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
      }
      return token;
    },
    
    // Create consistent session from token
    async session({ session, token }): Promise<Session> {
      // Ensure session user exists
      if (!session.user) {
        session.user = {
          id: 'guest',
          name: 'Guest',
          email: null,
          image: null
        };
        return session;
      }
      
      // Use token sub for user ID
      if (token?.sub) {
        session.user.id = token.sub;
        
        // Only fetch wallet info for authenticated users
        try {
          const userWallets = await prisma.wallet.findMany({
            where: { userId: token.sub },
            take: 1
          });
          
          if (userWallets.length > 0) {
            session.user.walletAddress = userWallets[0].address;
            session.user.walletType = userWallets[0].walletType;
          }
        } catch (error) {
          // Non-fatal error, continue with session
          console.error("Error fetching wallet:", error);
        }
      }
      
      return session;
    },
    
    // Validate sign in
    async signIn({ account, profile }) {
      // Verify Google credentials are set
      if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        console.error("Missing Google OAuth credentials");
        return false;
      }
      
      // Require a verified email for sign in
      if (account?.provider === 'google' && profile?.email) {
        return true;
      }
      
      return true; // Allow sign in
    },
    
    // Handle redirects
    async redirect({ url }) {
      // Use calculated base URL from our function
      const effectiveBaseUrl = getBaseUrl();
      
      // Absolute URL that starts with base URL
      if (url.startsWith(effectiveBaseUrl)) {
        return url;
      }
      
      // Relative URL
      if (url.startsWith('/')) {
        return `${effectiveBaseUrl}${url}`;
      }
      
      // Fallback
      return effectiveBaseUrl;
    }
  },
  
  // Use NEXTAUTH_SECRET for JWT signing
  secret: process.env.NEXTAUTH_SECRET,
  
  // Enable debug mode for detailed logs
  debug: process.env.NODE_ENV !== 'production',
}; 