import NextAuth, { type NextAuthOptions, Session, User } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '@/lib/prisma';
import { JWT } from 'next-auth/jwt';
import { Adapter } from 'next-auth/adapters';

// Extend the built-in session and JWT types
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
  }
}

// Log the current environment for debugging
console.log("AUTH DEBUG - Environment:", {
  NODE_ENV: process.env.NODE_ENV,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  VERCEL_URL: process.env.VERCEL_URL,
});

// Calculate the base URL based on environment
const baseUrl = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : process.env.NEXTAUTH_URL || 'http://localhost:3000';

console.log("AUTH DEBUG - Using base URL:", baseUrl);

// NextAuth configuration with Prisma database adapter
const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  // Force the correct redirect URI
  useSecureCookies: !!process.env.VERCEL_URL,
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: !!process.env.VERCEL_URL
      }
    }
  },
  callbacks: {
    async session({ session, token, user }: { session: Session; token: JWT; user?: User }): Promise<Session> {
      // Add the user ID to the session
      if (session.user && user) {
        session.user.id = user.id;
      } else if (session.user && token) {
        session.user.id = token.sub;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      console.log("AUTH DEBUG - Sign-in callback called with:", {
        user: user.email,
        provider: account?.provider,
        callbackUrl: `${baseUrl}/api/auth/callback/${account?.provider}`
      });
      
      // Ensure user is saved to the database, even with JWT strategy
      if (user.email) {
        try {
          // Check if this user already exists
          const existingUser = await prisma.user.findUnique({
            where: {
              email: user.email,
            },
          });

          // If user doesn't exist yet, create them
          if (!existingUser && user.email) {
            const newUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name,
                image: user.image,
              },
            });
            console.log('Created new user:', user.email, newUser.id);
          } else if (existingUser) {
            console.log('Found existing user:', existingUser.email, existingUser.id);
          }
          return true;
        } catch (error) {
          console.error("Error in signIn callback:", error);
          return true; // Still allow sign in even if DB operations fail
        }
      }
      return true;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
};

// Export handlers for GET and POST
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 