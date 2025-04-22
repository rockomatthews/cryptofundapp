import { type NextAuthOptions, Session, User } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '@/lib/prisma';
import { JWT } from 'next-auth/jwt';
import { Adapter } from 'next-auth/adapters';

// Log environment variables relevant to NextAuth (excluding secrets)
console.log('NextAuth Config Environment:', { 
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NODE_ENV: process.env.NODE_ENV,
  VERCEL_URL: process.env.VERCEL_URL,
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
  callbacks: {
    async session({ session, token, user }: { session: Session; token: JWT; user?: User }): Promise<Session> {
      console.log('Session callback called with:', { 
        sessionUserId: session?.user?.id,
        tokenSub: token?.sub,
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
      
      // Add the user ID to the session
      if (user?.id) {
        // Case 1: We have a user from the database (database session strategy)
        session.user.id = user.id;
        
        // Get user's wallet addresses if available
        try {
          const userWallets = await prisma.wallet.findMany({
            where: { userId: user.id }
          });
          
          if (userWallets && userWallets.length > 0) {
            // Add the first wallet address to the session for convenience
            session.user.walletAddress = userWallets[0].address;
            session.user.walletType = userWallets[0].walletType;
          }
        } catch (error) {
          console.error("Error fetching user wallets:", error);
        }
      } else if (token?.sub) {
        // Case 2: We have a token with sub (JWT session strategy)
        session.user.id = token.sub;
      } else {
        // Case 3: Fallback if neither user nor token has ID
        session.user.id = session.user.id || `temp-${Date.now()}`;
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