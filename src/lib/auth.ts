import { type NextAuthOptions, Session, User } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '@/lib/prisma';
import { JWT } from 'next-auth/jwt';
import { Adapter } from 'next-auth/adapters';

// Get the URL to use for NextAuth
// This is critical for OAuth callback URLs to work correctly
function getBaseUrl() {
  // Priority order:
  // 1. NEXTAUTH_URL (explicitly set)
  // 2. Production domains (support both www and non-www)
  // 3. Fallback to localhost
  
  if (process.env.NEXTAUTH_URL) {
    console.log('Using NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
    return process.env.NEXTAUTH_URL;
  }
  
  // For production deployments - support both with and without www
  if (process.env.NODE_ENV === 'production') {
    // Default to www version as that's what Google seems to prefer
    const productionUrl = 'https://www.cryptostarter.app';
    console.log('Using production URL:', productionUrl);
    return productionUrl;
  }
  
  // Fallback for local development
  console.log('Using default localhost URL');
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

// NextAuth configuration with Prisma database adapter
export const authOptions: NextAuthOptions = {
  // Use JWT strategy in production as it's more reliable when DB connections 
  // might be an issue. This should fix the sign-in loop issue.
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
        domain: ".cryptostarter.app" // Note the leading dot to include subdomains
      }
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
      // Explicitly set the callback URL to match what Google expects
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      // If user is provided, add it to the token
      if (user) {
        token.userId = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token, user }: { session: Session; token: JWT; user?: User }): Promise<Session> {
      console.log('Session callback called with:', { 
        sessionUserId: session?.user?.id,
        tokenSub: token?.sub,
        tokenUserId: token?.userId,
        userId: user?.id
      });
      
      // Ensure the user object exists in the session
      if (!session.user) {
        session.user = {
          id: 'temp-' + Date.now(),
          name: 'Guest',
          email: null,
          image: null
        };
        return session;
      }
      
      // Since we're using JWT strategy, use the token for the ID
      // This ensures we always have user ID even without DB access
      if (token?.sub) {
        session.user.id = token.sub;
      } else if (user?.id) {
        session.user.id = user.id;
      }
      
      // Try to get wallet info if possible, but don't require it
      if (session.user.id && session.user.id !== 'temp-' + Date.now()) {
        try {
          const userWallets = await prisma.wallet.findMany({
            where: { userId: session.user.id }
          });
          
          if (userWallets && userWallets.length > 0) {
            session.user.walletAddress = userWallets[0].address;
            session.user.walletType = userWallets[0].walletType;
          }
        } catch (error) {
          console.error("Error fetching user wallets:", error);
          // Non-fatal error, continue with session
        }
      }
      
      return session;
    },
    async signIn({ user, account, profile }) {
      console.log("Sign-in callback called with:", { 
        user: user?.email,
        provider: account?.provider,
        userId: user?.id, 
        hasProfile: !!profile
      });
      
      // Check for missing credentials that would cause sign-in loops
      if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        console.error("ERROR: Missing OAuth credentials for Google provider");
        return false; // Block sign-in and show error page
      }
      
      // Always return true for successful sign-in
      // This avoids silent failures that cause redirect loops
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Ensure redirects use the correct base URL
      // This helps avoid issues with mismatched URLs
      const calculatedBaseUrl = getBaseUrl();
      
      console.log('Redirect info:', { 
        providedUrl: url, 
        baseUrl, 
        calculatedBaseUrl 
      });
      
      // Handle both www and non-www variations
      const isWwwUrl = url.includes('www.cryptostarter.app');
      const isNonWwwUrl = url.includes('cryptostarter.app') && !url.includes('www.');
      
      // If the URL is relative, use the calculated base URL
      if (url.startsWith('/')) {
        return `${calculatedBaseUrl}${url}`;
      }
      // If the URL is on our domain (either www or non-www), allow it
      else if (isWwwUrl || isNonWwwUrl) {
        return url;
      }
      // Otherwise redirect to home
      return calculatedBaseUrl;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
}; 